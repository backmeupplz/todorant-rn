import React, { Component, useEffect, useMemo, useRef } from 'react'
import { Container, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { PlanningVM } from '@views/planning/PlanningVM'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlusButton } from '@components/PlusButton'
import {
  Alert,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import DraggableSectionList, {
  DragEndParams,
} from '@upacyxou/react-native-draggable-sectionlist'
import { Month } from '@upacyxou/react-native-month'
import {
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
  when,
} from 'mobx'
import moment from 'moment'
import { sharedSettingsStore } from '@stores/SettingsStore'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
} from '@utils/time'
import Animated, { Value } from 'react-native-reanimated'
import { navigate } from '@utils/navigation'
import { getTitle, Todo } from '@models/Todo'
import { debounce } from 'lodash'
import { TodoHeader } from '@components/TodoHeader'
import { hydration } from '@stores/hydration/hydratedStores'
import { MelonTodo } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { v4 } from 'uuid'
import { isTodoOld } from '@utils/isTodoOld'
import { database, todosCollection } from '@utils/wmdb'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TodoColumn } from '@utils/melondb'

@observer
export class PlanningContent extends Component {
  @observable vm?: PlanningVM
  @observable currentMonth = new Date().getMonth()
  @observable currentYear = new Date().getUTCFullYear()
  currentX = new Value(0)
  currentY = new Value(0)
  todoHeight = 0
  lastTimeY = 0
  lastTimeX = 0

  @observable offset = 15

  @computed get isCompleted() {
    runInAction(() => (this.offset = 15))
    return sharedAppStateStore.todoSection === TodoSectionType.completed
  }

  @computed get completedWithOffset() {
    return this.vm?.completedTodosData.extend(Q.experimentalTake(this.offset))
  }

  @computed get uncompletedWithOffset() {
    return this.vm?.uncompletedTodosData.extend(Q.experimentalTake(this.offset))
  }

  @computed get querySearch() {
    return this.uncompletedWithOffset?.extend(
      Q.where(
        TodoColumn.text,
        Q.like(
          `%${Q.sanitizeLikeString(
            sharedAppStateStore.searchQuery[0] ||
              sharedAppStateStore.hash.join(' ')
          )}%`
        )
      )
    )
  }

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    await when(() => hydration.isHydrated)
    this.vm = new PlanningVM()
  }

  renderPlanningRequiredMessage() {
    return (
      sharedTodoStore.isPlanningRequired &&
      sharedAppStateStore.todoSection !== TodoSectionType.completed && (
        <Text
          style={{
            backgroundColor: 'dodgerblue',
            color: 'white',
            padding: 12,
          }}
        >
          {translate('planningText')}
        </Text>
      )
    )
  }

  renderCircle() {
    return (
      sharedAppStateStore.activeDay &&
      sharedAppStateStore.activeCoordinates.x &&
      sharedAppStateStore.activeCoordinates.y && (
        <Animated.View
          style={{
            ...styles.circle,
            transform: [
              {
                translateX: this.currentX,
              },
              {
                translateY: this.currentY,
              },
            ],
          }}
        />
      )
    )
  }
  renderCalendar() {
    return (
      !!sharedAppStateStore.calendarEnabled && (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              padding: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (this.currentMonth <= 0) {
                  this.currentYear--
                  this.currentMonth = 11
                } else {
                  this.currentMonth--
                }
              }}
            >
              <Icon
                type="MaterialIcons"
                name={'keyboard-arrow-left'}
                style={{ color: sharedColors.textColor, opacity: 0.5 }}
              />
            </TouchableOpacity>
            <Text style={{ color: sharedColors.textColor }}>
              {moment(this.currentMonth + 1, 'MM')
                .locale(
                  sharedSettingsStore.language
                    ? sharedSettingsStore.language
                    : 'en'
                )
                .format('MMMM')}{' '}
              {this.currentYear}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (this.currentMonth >= 11) {
                  this.currentYear++
                  this.currentMonth = 0
                } else {
                  this.currentMonth++
                }
              }}
            >
              <Icon
                type="MaterialIcons"
                name={'keyboard-arrow-right'}
                style={{ color: sharedColors.textColor, opacity: 0.5 }}
              />
            </TouchableOpacity>
          </View>
          <View>
            <Month
              onActiveDayChange={(day: Date) => {
                if (!sharedAppStateStore.calendarEnabled) return
                sharedAppStateStore.activeDay = day
              }}
              dark={sharedSettingsStore.isDark}
              onPress={(day: Date) => {
                navigate('AddTodo', { date: getDateString(day) })
              }}
              emptyDays={(emptyDays: any) => {}}
              activeCoordinates={sharedAppStateStore.activeCoordinates}
              month={this.currentMonth}
              year={this.currentYear}
              showWeekdays
              locale={sharedSettingsStore.language}
            />
          </View>
        </View>
      )
    )
  }
  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {this.renderPlanningRequiredMessage()}
        {this.renderCalendar()}
        {this.renderCircle()}
        {!!this.vm && (
          <EnhancedDraggableSectionList
            todo={
              sharedAppStateStore.searchQuery.length ||
              sharedAppStateStore.hash.length
                ? this.querySearch
                : this.isCompleted
                ? this.completedWithOffset
                : this.uncompletedWithOffset
            }
            isCompleted={this.isCompleted}
            increaseOffset={async () => {
              const todosAmount = await todosCollection.query().fetchCount()
              if (todosAmount <= this.offset) return
              this.offset += 15
            }}
          />
        )}
        <PlusButton />
      </Container>
    )
  }
}

interface Section {
  section: string
  data: MelonTodo[]
}

const enhance = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const EnhancedDraggableSectionList = enhance(
  ({
    todo,
    isCompleted,
    increaseOffset,
  }: {
    todo: MelonTodo[]
    isCompleted: boolean
    increaseOffset: () => void
  }) => {
    const todoSectionMap = {} as any
    let currentTitle: string | undefined
    let sectionIndex = 0
    for (const realmTodo of todo) {
      const realmTodoTitle = getTitle(realmTodo)
      if (currentTitle && currentTitle !== realmTodoTitle) {
        sectionIndex++
      }
      if (todoSectionMap[realmTodoTitle]) {
        todoSectionMap[realmTodoTitle].data.push(realmTodo)
      } else {
        todoSectionMap[realmTodoTitle] = {
          order: sectionIndex,
          section: realmTodoTitle,
          data: [realmTodo],
        }
      }
    }

    const todosMap = Object.keys(todoSectionMap).map((key) => {
      return todoSectionMap[key]
    })

    return isCompleted ? (
      <DraggableSectionList<MelonTodo, Section>
        ListEmptyComponent={<NoTodosPlaceholder />}
        onEndReachedThreshold={0}
        onEndReached={() => increaseOffset()}
        onViewableItemsChanged={() => {}}
        contentContainerStyle={{ paddingBottom: 100 }}
        onMove={({ nativeEvent: { absoluteX, absoluteY } }) => {
          if (!sharedAppStateStore.calendarEnabled) return
          // TODO calendar actions
          //this.currentX.setValue(absoluteX as any)
          //this.currentY.setValue((absoluteY - this.todoHeight) as any)
          //this.vm?.setCoordinates(absoluteY, absoluteX)
        }}
        autoscrollSpeed={200}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={1}
        onDragEnd={onDragEnd}
        isSectionHeader={(a: any) => {
          if (a === undefined) {
            return false
          }
          return !a.text
        }}
        renderItem={renderItem}
        renderSectionHeader={({ item, drag, index, isActive }) => {
          return (
            <TodoHeader
              date={true}
              drag={drag}
              isActive={isActive}
              item={item.section}
              key={item.section}
              vm={undefined}
            />
          )
        }}
        data={todosMap}
        keyExtractor={(item) => item.id}
      />
    ) : (
      <DraggableSectionList<MelonTodo, Section>
        ListEmptyComponent={<NoTodosPlaceholder />}
        onEndReachedThreshold={0.5}
        onEndReached={() => increaseOffset()}
        onViewableItemsChanged={() => {}}
        contentContainerStyle={{ paddingBottom: 100 }}
        onMove={({ nativeEvent: { absoluteX, absoluteY } }) => {
          if (!sharedAppStateStore.calendarEnabled) return
        }}
        autoscrollSpeed={200}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={0.9}
        onDragEnd={onDragEnd}
        isSectionHeader={(a: any) => {
          if (a === undefined) {
            return false
          }
          return !a.text
        }}
        renderItem={renderItem}
        renderSectionHeader={({ item, drag, index, isActive }) => {
          return (
            <TodoHeader
              date={true}
              drag={drag}
              isActive={isActive}
              item={item.section}
              key={item.section}
              vm={undefined}
            />
          )
        }}
        data={todosMap}
        keyExtractor={(item) => item.id}
      />
    )
  }
)

async function onDragEnd(params: DragEndParams<MelonTodo | string>) {
  const { beforeChangesArr, dataArr, to, from, promise } = params
  // enable loader
  sharedAppStateStore.changeLoading(false)
  // check is calendar dragging
  if (sharedAppStateStore.activeDay) {
    const todo = dataArr[to] as MelonTodo
    if (todo) {
      //realm.write(() => {
      todo.date = getDateDateString(sharedAppStateStore.activeDay!)
      todo.monthAndYear = getDateMonthAndYearString(
        sharedAppStateStore.activeDay!
      )
      const newTitle = getTitle(todo)
      todo._exactDate = new Date(newTitle)
      todo.updatedAt = new Date()
      //})
    }
    // discard calendar after applying changes
    sharedAppStateStore.activeDay = undefined
    sharedAppStateStore.activeCoordinates = { x: 0, y: 0 }
    //this.setCoordinates.cancel()
    promise()
  } else {
    // help us to find closest section (looks from bottom to the top)
    const findClosestSection = (
      index: number,
      arrToSearch: (string | MelonTodo)[]
    ) => {
      let closestSection = 0
      for (let i = index; i >= 0; --i) {
        if (typeof arrToSearch[i] === 'string') {
          closestSection = i
          break
        }
      }
      return closestSection
    }

    const toUpdate = [] as MelonTodo[]

    let disableLoading = false

    const closestFrom = findClosestSection(from, beforeChangesArr)
    const closestTo = findClosestSection(to, dataArr)
    if (closestFrom === closestTo) {
      let lastOrder = 0
      for (let i = closestTo + 1; ; i++) {
        const item = dataArr[i]
        if (item === undefined) break
        if (typeof item === 'string') break
        toUpdate.push(item.prepareUpdate((todo) => (todo.order = lastOrder)))
        lastOrder++
      }
    }
    await database.write(async () => await database.batch(...toUpdate))
    promise()
  }
}

const renderItem = ({
  item,
  drag,
  isActive,
}: {
  item: MelonTodo
  drag: () => void
  isActive: boolean
}) => {
  if (!item) return
  return (
    <View style={{ padding: false ? 10 : 0 }} key={item.id}>
      <TodoCard
        todo={item}
        type={
          sharedAppStateStore.todoSection === TodoSectionType.planning
            ? CardType.planning
            : CardType.done
        }
        drag={drag}
        active={isActive}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: sharedColors.primaryColor,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})
