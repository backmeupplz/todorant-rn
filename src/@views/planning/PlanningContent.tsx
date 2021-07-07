import React, { Component } from 'react'
import { Container, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableSectionList, {
  DragEndParams,
} from '@upacyxou/react-native-draggable-sectionlist'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { PlanningVM } from '@views/planning/PlanningVM'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlusButton } from '@components/PlusButton'
import {
  SectionList,
  SectionListData,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Month } from '@upacyxou/react-native-month'
import { computed, makeObservable, observable, when } from 'mobx'
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

@observer
export class PlanningContent extends Component {
  @observable vm = new PlanningVM()
  @observable currentMonth = new Date().getMonth()
  @observable currentYear = new Date().getUTCFullYear()
  currentX = new Value(0)
  currentY = new Value(0)
  todoHeight = 0
  lastTimeY = 0
  lastTimeX = 0

  @observable offset = 50

  @computed get isCompleted() {
    return sharedAppStateStore.todoSection === TodoSectionType.completed
  }

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    setInterval(() => (this.offset += 1), 250000)
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
        <EnhancedDraggableSectionList
          todo={
            this.isCompleted
              ? this.vm?.completedTodosData.extend(
                  Q.experimentalTake(this.offset),
                  Q.experimentalSortBy(
                    'exact_date_at',
                    this.isCompleted ? Q.desc : Q.asc
                  ),
                  Q.experimentalSortBy('is_frog', Q.desc),
                  Q.experimentalSortBy('order', Q.asc)
                )
              : this.vm?.uncompletedTodosData.extend(
                  Q.experimentalTake(this.offset),
                  Q.experimentalSortBy(
                    'exact_date_at',
                    this.isCompleted ? Q.desc : Q.asc
                  ),
                  Q.experimentalSortBy('is_frog', Q.desc),
                  Q.experimentalSortBy('order', Q.asc)
                )
          }
          isCompleted={this.isCompleted}
        />
        <PlusButton />
      </Container>
    )
  }
}

const enhance = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const EnhancedDraggableSectionList = enhance(
  ({ todo, isCompleted }: { todo: MelonTodo[]; isCompleted: boolean }) => {
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
      <SectionList
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        initialNumToRender={10}
        updateCellsBatchingPeriod={1}
        sections={todosMap}
        renderItem={renderItem}
        renderSectionHeader={(item) => {
          return (
            <TodoHeader
              date={true}
              drag={undefined}
              isActive={undefined}
              item={item.section.section}
              key={item.section.section}
              vm={undefined}
            />
          )
        }}
      />
    ) : (
      <DraggableSectionList
        onEndReached={() => {}}
        onEndReachedThreshold={0.3}
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
        maxToRenderPerBatch={1}
        initialNumToRender={10}
        updateCellsBatchingPeriod={1}
        onDragEnd={() => {}}
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
        // TODO implement tags search and query search
        //  as ref
        //  (sharedAppStateStore.hash.length ||
        //  sharedAppStateStore.searchQuery.length > 0
        //    ? this.vm.uncompletedTodosData.allTodosAndHash?.slice()
        //    : this.vm.uncompletedTodosData.todosArray) || []
        data={todosMap}
        keyExtractor={(item) => item.id}
      />
    )
  }
)

function onDragEnd(params: DragEndParams<MelonTodo | string>) {
  const { beforeChangesArr, dataArr, to, from, promise } = params
  promise()
  if (from === to || from === 0 || to === 0) {
    promise()
    return
  }
  // we are saving promise for reseting hover state in future
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

  let disableLoading = false

  const closestFrom = findClosestSection(from, beforeChangesArr)
  const closestTo = findClosestSection(to, dataArr)
  database.write(async () => {
    const lowerDay = Math.min(closestFrom, closestTo)
    const maxDay = Math.max(closestFrom, closestTo)
    let lastOrder = 0
    let lastSection = dataArr[lowerDay] as string
    for (let i = lowerDay + 1; ; i++) {
      const item = dataArr[i]
      if (item === undefined) break
      if (typeof item === 'string') {
        // if new section, outside of our draggable items begin
        if (
          new Date(item).getTime() >
          new Date(dataArr[maxDay] as string).getTime()
        )
          break
        lastOrder = 0
        lastSection = item
        continue
      }
      if (i === to) {
        item.update((item) => {
          item.order = lastOrder
        })
        lastOrder++
      }
    }
    if (disableLoading) {
      sharedAppStateStore.changeLoading(false)
    }
  })
}

const renderItem = ({ item, drag, index, isActive }) => {
  if (!item) return
  return (
    <View style={{ padding: false ? 10 : 0 }} key={item.id}>
      <TodoCard
        todo={item as Todo}
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
