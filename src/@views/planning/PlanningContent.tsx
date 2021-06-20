import React, { Component } from 'react'
import { Container, Text, View, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableSectionList from '@upacyxou/react-native-draggable-sectionlist'
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
import { makeObservable, observable, when } from 'mobx'
import moment from 'moment'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { getDateString } from '@utils/time'
import Animated, { Value } from 'react-native-reanimated'
import { navigate } from '@utils/navigation'
import { getTitle, Todo } from '@models/Todo'
import { debounce } from 'lodash'
import { TodoHeader } from '@components/TodoHeader'
import { hydration } from '@stores/hydration/hydratedStores'
import { MelonTodo } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { todosCollection } from '../../../App'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { v4 } from 'uuid'

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

  todos = todosCollection
    .query(Q.where('is_completed', false), Q.where('is_deleted', false))
    .observe()

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
        <ImReally todo={this.todos} />
        <PlusButton />
      </Container>
    )
  }
}

let styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: sharedColors.primaryColor,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})

const TodoSectionList = ({ todos }: { todos: MelonTodo[] }) => {
  console.log(todos)
  const todoSectionMap = {} as any
  let currentTitle: string | undefined
  let sectionIndex = 0

  for (const watermelonTodo of todos) {
    const realmTodoTitle = getTitle(watermelonTodo)
    if (currentTitle && currentTitle !== realmTodoTitle) {
      sectionIndex++
    }
    if (todoSectionMap[realmTodoTitle]) {
      todoSectionMap[realmTodoTitle].data.push(watermelonTodo as any)
    } else {
      todoSectionMap[realmTodoTitle] = {
        order: sectionIndex,
        section: realmTodoTitle,
        data: [watermelonTodo as any],
      }
    }
  }

  const whatINeed = Object.keys(todoSectionMap).map((key) => {
    return todoSectionMap[key]
  })

  return (
    <SectionList
      renderItem={({ item, index, section }) => <Text></Text>}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={{ fontWeight: 'bold' }}></Text>
      )}
      sections={whatINeed}
      keyExtractor={(item) => item.id}
    />
  )
}

const TryingEnhancedTodo = ({ todo }: { todo: MelonTodo[] }) => {
  const sections = {} as any

  const todoSectionMap = {} as any
  const todoIdToDateMap = new Map<string, string>()

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

  const idk = Object.keys(todoSectionMap).map((key) => {
    return todoSectionMap[key]
  })

  return (
    <SectionList
      renderItem={({ item, index, section }) => {
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
              drag={undefined}
              active={undefined}
            />
          </View>
        )
      }}
      renderSectionHeader={(item: any, index: any) => {
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
      sections={idk}
      keyExtractor={(item) => item.id}
    />
  )
}

const enhancedTest = withObservables(['todo'], ({ todo }) => {
  // console.log(todo)
  return {
    todo,
  }
})

const ImReally = enhancedTest(TryingEnhancedTodo)
