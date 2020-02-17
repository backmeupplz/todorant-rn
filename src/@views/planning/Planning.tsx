import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { List, ListItem, Container, Content, Text } from 'native-base'
import { computed } from 'mobx'
import { Todo } from '@models/Todo'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateString, isDateTooOld } from '@utils/time'
import { TodoCard } from '@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '@utils/navigation'
import { AddTodo } from '@views/add/AddTodo'

const Stack = createStackNavigator()

interface SectionHeaderOrTodo {
  title?: string
  item?: Todo
}

class PlanningVM {
  @computed
  get todosWithSections() {
    const mappedTodos = sharedTodoStore.todos.reduce((prev, cur) => {
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
        return -1
      } else if (
        !isDateTooOld(a.title, today) &&
        isDateTooOld(b.title, today)
      ) {
        return 1
      }
      return new Date(a.title) > new Date(b.title) ? 1 : -1
    })
    let result: SectionHeaderOrTodo[] = []
    for (const todoSection of gatheredTodos) {
      result = [
        ...result,
        {
          title: todoSection.title,
        },
        ...todoSection.todos.map(v => ({ item: v })),
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
              <TodoCard todo={item.item!} key={index} />
            )
          }
          keyExtractor={(_, index) => `${index}`}
        ></List>
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

export function Planning() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Planning" component={PlanningContent} />
      <Stack.Screen
        name="AddTodo"
        component={AddTodo}
        options={{ title: 'Add todo' }}
      />
    </Stack.Navigator>
  )
}
