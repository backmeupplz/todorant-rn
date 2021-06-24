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
import { makeObservable, observable, when } from 'mobx'
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
import { database, todosCollection } from '../../../App'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { v4 } from 'uuid'
import { isTodoOld } from '@utils/isTodoOld'

export const PlanningContent = () => {
  let vm: PlanningVM

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getUTCFullYear()

  const currentX = new Value(0)
  const currentY = new Value(0)

  const todoHeight = 0

  const lastTimeY = 0
  const lastTimeX = 0

  const todos = todosCollection.query(
    Q.where('is_completed', false),
    Q.where('is_deleted', false),
    Q.experimentalTake(50),
    Q.experimentalSortBy('order', Q.asc),
    Q.experimentalSortBy('is_frog', Q.desc)
  )

  vm = new PlanningVM()

  return (
    <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
      <ImReally todo={todos} />
      <PlusButton />
    </Container>
  )
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

const TodoSectionList = (test) => {
  const todos = test.todos
  console.log(test)
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

const TryingEnhancedTodo = ({
  todo,
  increaseOffset,
}: {
  todo: MelonTodo[]
}) => {
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
      removeClippedSubviews={true}
      maxToRenderPerBatch={1}
      initialNumToRender={10}
      updateCellsBatchingPeriod={1}
      renderItem={renderItem}
      renderSectionHeader={(item: any) => {
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
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const ImReally = enhancedTest(TryingEnhancedTodo)

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

const renderItem = ({ item, section }) => {
  console.log('ыыыы')
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
}
