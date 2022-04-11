import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { CardType } from '@components/TodoCard/CardType'
import { Component } from 'react'
import { Container, Icon, Text, View } from 'native-base'
import { MelonTodo } from '@models/MelonTodo'
import { Month } from '@upacyxou/react-native-month'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlanningVM } from '@views/planning/PlanningVM'
import { PlusButton } from '@components/PlusButton'
import { Q } from '@nozbe/watermelondb'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TodoCard } from '@components/TodoCard'
import { TodoColumn } from '@utils/watermelondb/tables'
import { TodoHeader } from '@components/TodoHeader'
import { TodoSectionType, sharedAppStateStore } from '@stores/AppStateStore'
import { checkSubscriptionAndNavigate } from '@utils/checkSubscriptionAndNavigate'
import { computed, makeObservable, observable, runInAction, when } from 'mobx'
import { database } from '@utils/watermelondb/wmdb'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
} from '@utils/time'
import { getTitle } from '@models/Todo'
import { hydration } from '@stores/hydration/hydratedStores'
import { isTodoOld } from '@utils/isTodoOld'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sanitizeLikeString } from '@utils/textSanitizer'
import { sharedColors } from '@utils/sharedColors'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
import { translate } from '@utils/i18n'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import Animated, { Value } from 'react-native-reanimated'
import DraggableFlatList, {
  DragEndParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import React from 'react'
import moment from 'moment'
import withObservables from '@nozbe/with-observables'

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
    return this.vm?.completedTodosData.extend(Q.take(this.offset))
  }

  @computed get uncompletedWithOffset() {
    return this.vm?.uncompletedTodosData.extend(Q.take(this.offset))
  }

  @computed get querySearch() {
    return (
      sharedAppStateStore.todoSection === TodoSectionType.completed
        ? this.completedWithOffset
        : this.uncompletedWithOffset
    )?.extend(
      Q.where(
        TodoColumn.text,
        Q.like(
          `%${sanitizeLikeString(
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
                checkSubscriptionAndNavigate('AddTodo', {
                  date: getDateString(day),
                })
              }}
              emptyDays={() => {
                return
              }}
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
              const todosAmount = await (this.isCompleted
                ? sharedTodoStore.undeletedCompleted.fetchCount()
                : sharedTodoStore.undeletedUncompleted.fetchCount())
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
    increaseOffset,
  }: {
    todo: MelonTodo[]
    increaseOffset: () => void
  }) => {
    const usedSection = new Set<string>()
    const todosAndDates: Array<MelonTodo | string> = []
    for (const realmTodo of todo) {
      const realmTodoTitle = getTitle(realmTodo)
      if (!usedSection.has(realmTodoTitle)) {
        usedSection.add(realmTodoTitle)
        todosAndDates.push(realmTodoTitle)
      }
      todosAndDates.push(realmTodo)
    }

    return (
      <DraggableFlatList
        ListEmptyComponent={<NoTodosPlaceholder />}
        onEndReachedThreshold={0.5}
        onEndReached={() => increaseOffset()}
        contentContainerStyle={{
          paddingBottom: useBottomTabBarHeight() * 2.5,
        }}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={0.9}
        onDragEnd={(params) => onDragEnd(params, todosAndDates)}
        renderItem={renderItem}
        data={todosAndDates}
        keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
      />
    )
  }
)

async function onDragEnd(
  { data, from, to }: DragEndParams<string | MelonTodo>,
  arrBeforeChanges: (string | MelonTodo)[]
) {
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

  const closestDayFrom = findClosestSection(from, arrBeforeChanges)
  const closestDayTo = findClosestSection(to, data)

  // if inside one day
  if (closestDayFrom === closestDayTo) {
    let lastOrder = 0
    let fromItem = arrBeforeChanges[from]
    let toItem = arrBeforeChanges[to]
    // if both of moved items are todos, and no one of them are section header
    if (fromItem !== 'string' && toItem !== 'string') {
      const fromBottomToTop = from > to
      const nearItem = arrBeforeChanges[
        fromBottomToTop ? to - 1 : to + 1
      ] as MelonTodo
      toItem = toItem as MelonTodo
      fromItem = fromItem as MelonTodo
      let secondOrder =
        nearItem && typeof nearItem !== 'string' ? nearItem.order : -1
      const firstOrder = toItem ? toItem.order : -1
      if (nearItem && nearItem.frog && !fromItem.frog) secondOrder = -1
      let average = (firstOrder + secondOrder) / 2
      // if there is nothing under or under is a section
      if (
        (!fromBottomToTop && typeof arrBeforeChanges[to + 1] === 'string') ||
        typeof arrBeforeChanges[to + 1] === 'undefined'
      )
        average = toItem.order + 1
      if (
        nearItem &&
        toItem.frog &&
        !nearItem.frog &&
        typeof arrBeforeChanges[to - 1] !== 'string'
      )
        average = toItem.order + 1
      toUpdate.push(
        (fromItem as MelonTodo).prepareUpdateWithDescription(
          (todo) => (todo.order = average),
          'reordering and setting up average order'
        )
      )
    } else {
      for (let i = closestDayTo + 1; ; i++) {
        const item = data[i]
        if (item === undefined) break
        if (typeof item === 'string') break
        toUpdate.push(
          item.prepareUpdateWithDescription(
            (todo) => (todo.order = lastOrder),
            'reordering and setting up closest order'
          )
        )
        lastOrder++
      }
    }
  } else if (typeof arrBeforeChanges[from] !== 'string') {
    let fromItem = arrBeforeChanges[from]
    let toItem = arrBeforeChanges[to]
    // if both of moved items are todos, and no one of them are section header
    if (fromItem !== 'string' && toItem !== 'string') {
      const fromBottomToTop = from > to
      const nearItem = arrBeforeChanges[
        fromBottomToTop ? to - 1 : to + 1
      ] as MelonTodo
      toItem = toItem as MelonTodo
      fromItem = fromItem as MelonTodo
      let secondOrder =
        nearItem && typeof nearItem !== 'string' ? nearItem.order : -1
      const firstOrder = toItem ? toItem.order : -1
      if (nearItem && nearItem.frog && !fromItem.frog) secondOrder = -1
      let average = (firstOrder + secondOrder) / 2
      // if there is nothing under or under is a section
      if (
        (!fromBottomToTop && typeof arrBeforeChanges[to + 1] === 'string') ||
        typeof arrBeforeChanges[to + 1] === 'undefined'
      )
        average = toItem.order + 1
      if (
        toItem.frog &&
        !nearItem.frog &&
        typeof arrBeforeChanges[to - 1] !== 'string'
      )
        average = toItem.order + 1
      if (
        typeof firstOrder === 'undefined' ||
        typeof secondOrder === 'undefined'
      ) {
        if (!fromBottomToTop) {
          average = secondOrder - 1
        } else {
          average = secondOrder + 1
        }
      }
      let markAsFrog = false
      let failed = false
      if (isTodoOld(fromItem)) {
        if (fromItem.frogFails < 3) {
          if (fromItem.frogFails >= 1) {
            markAsFrog = true
          }
          failed = true
        } else {
          Alert.alert(translate('error'), translate('breakdownRequest'), [
            {
              text: translate('cancel'),
              style: 'cancel',
            },
            {
              text: translate('breakdownButton'),
              onPress: () => {
                navigate('BreakdownTodo', {
                  breakdownTodo: fromItem,
                })
              },
            },
          ])
          sharedSync.sync(SyncRequestEvent.Todo)
          // promise()
          return
        }
      }
      toUpdate.push(
        (fromItem as MelonTodo).prepareUpdateWithDescription((todo) => {
          if (markAsFrog) todo.frog = true
          if (failed) todo.frogFails++
          todo.order = average
          todo.date = nearItem?.date || (toItem as MelonTodo).date
          todo.monthAndYear =
            nearItem?.monthAndYear || (toItem as MelonTodo).monthAndYear
          todo._exactDate = new Date(getTitle(todo))
        }, 'reordering between days')
      )
    }
  } else {
    const lowerDay = Math.min(closestDayFrom, closestDayTo)
    const maxDay = Math.max(closestDayFrom, closestDayTo)
    let lastOrder = 0
    let lastSection = data[lowerDay] as string
    for (let i = lowerDay + 1; ; i++) {
      const item = data[i]
      if (item === undefined) break
      if (typeof item === 'string') {
        // if new section, outside of our draggable items begin
        if (
          new Date(item).getTime() > new Date(data[maxDay] as string).getTime()
        )
          break
        lastOrder = 0
        lastSection = item
        continue
      }
      let markAsFrog = false
      let failed = false
      if (i === to) {
        if (isTodoOld(item)) {
          if (item.frogFails < 3) {
            if (item.frogFails >= 1) {
              markAsFrog = true
            }
            failed = true
          } else {
            Alert.alert(translate('error'), translate('breakdownRequest'), [
              {
                text: translate('cancel'),
                style: 'cancel',
              },
              {
                text: translate('breakdownButton'),
                onPress: () => {
                  navigate('BreakdownTodo', {
                    breakdownTodo: item,
                  })
                },
              },
            ])
            lastOrder++
            continue
          }
        }
      }
      toUpdate.push(
        item.prepareUpdateWithDescription((todo) => {
          if (markAsFrog) todo.frog = true
          if (failed) todo.frogFails++
          todo.date = getDateDateString(lastSection)
          todo.monthAndYear = getDateMonthAndYearString(lastSection)
          todo._exactDate = new Date(lastSection)
          todo.order = lastOrder
        }, 'reordering section headers')
      )
      lastOrder++
    }
  }
  await database.write(async () => await database.batch(...toUpdate))
  sharedSync.sync(SyncRequestEvent.Todo)
}

const renderItem = ({
  item,
  drag,
}: {
  item: MelonTodo | string
  drag: () => void
}) => {
  if (!item) return
  if (typeof item === 'string') {
    return (
      <ScaleDecorator>
        <TodoHeader
          date={true}
          drag={drag}
          isActive={false}
          item={item}
          key={item}
        />
      </ScaleDecorator>
    )
  }
  return (
    <ScaleDecorator>
      <View style={{ padding: 0 }} key={item.id}>
        <TodoCard
          todo={item}
          type={
            sharedAppStateStore.todoSection === TodoSectionType.planning
              ? CardType.planning
              : CardType.done
          }
          drag={drag}
          active={false}
        />
      </View>
    </ScaleDecorator>
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
