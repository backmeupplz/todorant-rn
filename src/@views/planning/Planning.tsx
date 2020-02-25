import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {
  List,
  Container,
  Text,
  Segment,
  Button,
  StyleProvider,
} from 'native-base'
import { computed } from 'mobx'
import { Todo, compareTodos } from '@models/Todo'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateString, isDateTooOld } from '@utils/time'
import { TodoCard, CardType } from '@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '@utils/navigation'
import { AddTodo } from '@views/add/AddTodo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import getTheme from '../../../native-base-theme/components'

const Stack = createStackNavigator()

interface SectionHeaderOrTodo {
  title?: string
  item?: Todo
}

class PlanningVM {
  @computed get todosWithSections() {
    const mappedTodos = sharedTodoStore.undeletedTodos
      .filter(todo =>
        sharedAppStateStore.todoSection === TodoSectionType.planning
          ? !todo.completed
          : todo.completed
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
}

@observer
class PlanningContent extends Component {
  vm = new PlanningVM()

  render() {
    return (
      <Container>
        <List
          dataArray={this.vm.todosWithSections}
          renderItem={({ item, index }) =>
            item.title ? (
              <Text style={{ marginHorizontal: 10, marginTop: 16 }} key={index}>
                {item.title}
              </Text>
            ) : (
              <TodoCard
                todo={item.item!}
                key={index}
                type={
                  sharedAppStateStore.todoSection === TodoSectionType.planning
                    ? CardType.planning
                    : CardType.done
                }
              />
            )
          }
          keyExtractor={(_, index) => `${index}`}
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
    return (
      <StyleProvider style={getTheme()}>
        <Segment>
          <Button
            first
            active={
              sharedAppStateStore.todoSection === TodoSectionType.planning
            }
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
            active={
              sharedAppStateStore.todoSection === TodoSectionType.completed
            }
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
      </StyleProvider>
    )
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
