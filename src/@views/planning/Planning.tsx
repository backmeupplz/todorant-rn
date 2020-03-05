import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Text, Segment, Button, Icon } from 'native-base'
import { computed } from 'mobx'
import { Todo, compareTodos, getTitle } from '@models/Todo'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateString, isDateTooOld } from '@utils/time'
import { TodoCard, CardType } from '@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '@utils/navigation'
import { AddTodo } from '@views/add/AddTodo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { sockets } from '@utils/sockets'

const Stack = createStackNavigator()

interface SectionHeaderOrTodo {
  title?: string
  item?: Todo
}

class PlanningVM {
  @computed get todosWithSections() {
    const mappedTodos = sharedTodoStore.undeletedTodos
      .filter(todo =>
        sharedAppStateStore.todoSection === TodoSectionType.planning ||
        !!sharedAppStateStore.hash
          ? !todo.completed
          : todo.completed
      )
      .filter(todo =>
        sharedAppStateStore.hash
          ? todo.text.indexOf(sharedAppStateStore.hash) > -1
          : true
      )
      .reduce((prev, cur) => {
        if (cur.date) {
          const date = `${cur.monthAndYear}-${cur.date}`
          if (prev[date]) {
            prev[date].push(cur)
          } else {
            prev[date] = [cur]
          }
        } else {
          const month = cur.monthAndYear
          if (prev[month]) {
            prev[month].push(cur)
          } else {
            prev[month] = [cur]
          }
        }
        return prev
      }, {} as { [index: string]: Todo[] })
    const gatheredTodos = [] as {
      title: string
      todos: Todo[]
    }[]
    for (const key in mappedTodos) {
      gatheredTodos.push({
        title: key,
        todos: mappedTodos[key],
      })
    }
    const today = getDateString(new Date())
    gatheredTodos.sort((a, b) => {
      if (isDateTooOld(a.title, today) && !isDateTooOld(b.title, today)) {
        return sharedAppStateStore.todoSection === TodoSectionType.planning
          ? -1
          : 1
      } else if (
        !isDateTooOld(a.title, today) &&
        isDateTooOld(b.title, today)
      ) {
        return sharedAppStateStore.todoSection === TodoSectionType.planning
          ? 1
          : -1
      }
      return sharedAppStateStore.todoSection === TodoSectionType.planning
        ? new Date(a.title) > new Date(b.title)
          ? 1
          : -1
        : new Date(a.title) < new Date(b.title)
        ? 1
        : -1
    })
    let result: SectionHeaderOrTodo[] = []
    for (const todoSection of gatheredTodos) {
      result = [
        ...result,
        {
          title: todoSection.title,
        },
        ...todoSection.todos
          .sort(
            compareTodos(
              sharedAppStateStore.todoSection === TodoSectionType.completed
            )
          )
          .map(v => ({ item: v })),
      ]
    }
    return result
  }

  onDragEnd = ({
    data,
    from,
    to,
  }: {
    data: SectionHeaderOrTodo[]
    from: number
    to: number
  }) => {
    const titleToIndexes = [] as [string, number, number][] // title, startIndex, endIndex

    this.todosWithSections.forEach((item, i) => {
      if (item.title) {
        titleToIndexes.push([item.title, i, i])
        if (titleToIndexes.length > 1) {
          titleToIndexes[titleToIndexes.length - 2][2] = i - 1
        }
      }
    })

    const affectedTitles = [] as string[]

    const draggedItem = this.todosWithSections[from]
    if (draggedItem.item) {
      const titleFrom = getTitle(draggedItem.item)
      let titleTo: string | undefined
      if (to === 0) {
        titleTo = titleToIndexes[0][0]
      } else {
        for (const titleToIndex of [...titleToIndexes].reverse()) {
          if (to > from ? to >= titleToIndex[1] : to > titleToIndex[1]) {
            titleTo = titleToIndex[0]
            break
          }
        }
      }
      if (titleTo) {
        if (titleFrom === titleTo) {
          affectedTitles.push(titleFrom)
        } else {
          affectedTitles.push(titleFrom, titleTo)
        }
      }
    } else if (draggedItem.title) {
      // Add the title
      affectedTitles.push(draggedItem.title)
      // Add old neighbours
      titleToIndexes.forEach((titleToIndex, i) => {
        if (titleToIndex[0] === draggedItem.title) {
          if (i - 1 > -1) {
            affectedTitles.push(titleToIndexes[i - 1][0])
          }
          if (i + 1 < titleToIndexes.length) {
            affectedTitles.push(titleToIndexes[i + 1][0])
          }
        }
      })
      // Add new neighbours
      for (const titleToIndex of titleToIndexes) {
        if (to > titleToIndex[1] && to <= titleToIndex[2]) {
          if (affectedTitles.indexOf(titleToIndex[0]) < 0) {
            affectedTitles.push(titleToIndex[0])
          }
        }
      }
    }

    const editedTodos = [] as Todo[]
    let currentTitle = ''
    let currentMonthAndYear = ''
    let currentDate: string | undefined
    for (const sectionHeaderOrTodo of data) {
      if (sectionHeaderOrTodo.title) {
        currentTitle = sectionHeaderOrTodo.title
        currentMonthAndYear = currentTitle.substr(0, 7)
        currentDate =
          currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
        break
      }
    }

    let titleCounter = ''
    const affectedSectionHeadersOrTodo = [] as SectionHeaderOrTodo[]
    for (const sectionHeaderOrTodo of data) {
      if (sectionHeaderOrTodo.title) {
        const prevIndex = affectedTitles.indexOf(titleCounter)
        if (prevIndex > -1) {
          affectedTitles.splice(prevIndex, 1)
          if (!affectedTitles.length) {
            break
          }
        }
        titleCounter = sectionHeaderOrTodo.title
      }
      if (!titleCounter || affectedTitles.indexOf(titleCounter) > -1) {
        affectedSectionHeadersOrTodo.push(sectionHeaderOrTodo)
      }
    }

    let orderCounter = 0
    affectedSectionHeadersOrTodo.forEach(sectionHeaderOrTodo => {
      if (sectionHeaderOrTodo.title) {
        if (sectionHeaderOrTodo.title !== currentTitle) {
          orderCounter = 0
        }
        currentTitle = sectionHeaderOrTodo.title
        currentMonthAndYear = currentTitle.substr(0, 7)
        currentDate =
          currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
      } else if (sectionHeaderOrTodo.item) {
        const todo = sectionHeaderOrTodo.item
        if (
          todo.order !== orderCounter ||
          todo.monthAndYear !== currentMonthAndYear ||
          todo.date !== currentDate
        ) {
          todo.order = orderCounter
          todo.monthAndYear = currentMonthAndYear
          todo.date = currentDate
          editedTodos.push(todo)
        }
        orderCounter++
      }
    })
    sharedTodoStore.modify(...editedTodos)
    sockets.todoSyncManager.sync()
  }
}

@observer
class PlanningContent extends Component {
  vm = new PlanningVM()

  render() {
    return (
      <Container>
        {sharedTodoStore.isPlanningRequired && (
          <Text
            style={{
              backgroundColor: 'dodgerblue',
              color: 'white',
              padding: 12,
            }}
          >
            Looks like you have some planning to do! Please, redistribute the
            outstanding tasks below to unlock the "Current" tab and to keep
            being productive. Cheers!
          </Text>
        )}
        <DraggableFlatList
          data={this.vm.todosWithSections}
          renderItem={({ item, index, drag, isActive }) =>
            item.title ? (
              <TouchableWithoutFeedback
                key={index}
                onLongPress={drag}
                style={{ paddingHorizontal: isActive ? 10 : 0 }}
              >
                <Text
                  style={{ marginHorizontal: 10, marginTop: 16 }}
                  key={index}
                >
                  {item.title}
                </Text>
              </TouchableWithoutFeedback>
            ) : (
              <TouchableWithoutFeedback
                key={index}
                onLongPress={drag}
                style={{ padding: isActive ? 10 : 0 }}
              >
                <TodoCard
                  todo={item.item!}
                  type={
                    sharedAppStateStore.todoSection === TodoSectionType.planning
                      ? CardType.planning
                      : CardType.done
                  }
                />
              </TouchableWithoutFeedback>
            )
          }
          keyExtractor={(_, index) => `${index}`}
          onDragEnd={this.vm.onDragEnd}
        />
        <ActionButton
          buttonColor="tomato"
          onPress={() => {
            navigate('AddTodo')
          }}
        />
      </Container>
    )
  }
}

@observer
class PlanningHeader extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Text>{sharedAppStateStore.hash}</Text>
    ) : (
      <Segment>
        <Button
          first
          active={sharedAppStateStore.todoSection === TodoSectionType.planning}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.planning
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.planning
                  ? 'white'
                  : 'tomato',
            }}
          >
            Planning
          </Text>
        </Button>
        <Button
          transparent
          last
          active={sharedAppStateStore.todoSection === TodoSectionType.completed}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.completed
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.completed
                  ? 'white'
                  : 'tomato',
            }}
          >
            Completed
          </Text>
        </Button>
      </Segment>
    )
  }
}

@observer
class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Button
        icon
        transparent
        small
        onPress={() => {
          sharedAppStateStore.hash = ''
        }}
      >
        <Icon type="MaterialIcons" name="close" />
      </Button>
    ) : null
  }
}

export function Planning() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Planning"
        component={PlanningContent}
        options={{
          headerTitle: () => {
            return <PlanningHeader />
          },
          headerRight: () => {
            return <PlanningHeaderRight />
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AddTodo"
        component={AddTodo}
        options={{ title: 'Add todo' }}
      />
      <Stack.Screen
        name="EditTodo"
        component={AddTodo}
        options={{ title: 'Edit todo' }}
      />
    </Stack.Navigator>
  )
}
