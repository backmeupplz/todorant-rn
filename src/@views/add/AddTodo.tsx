import React, { Component } from 'react'
import { Container, Content, Text, Icon, View } from 'native-base'
import { goBack, navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { getDateMonthAndYearString } from '@utils/time'
import { Todo, getTitle, isTodoOld } from '@models/Todo'
import { fixOrder } from '@utils/fixOrder'
import uuid from 'uuid'
import { useRoute, RouteProp } from '@react-navigation/native'
import { realm } from '@utils/realm'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { extraButtonProps } from '@utils/extraButtonProps'
import { addButtonStore } from '@components/AddButton'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { linkify } from '@utils/linkify'
import { sharedTagStore } from '@stores/TagStore'
import { TodoVM } from '@views/add/TodoVM'
import { AddTodoScreenType } from '@views/add/AddTodoScreenType'
import { AddTodoForm } from '@views/add/AddTodoForm'
import { Alert } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import { Button } from '@components/Button'
import { startConfetti } from '@components/Confetti'

@observer
class AddTodoContent extends Component<{
  route: RouteProp<
    Record<string, { editedTodo: Todo; breakdownTodo: Todo } | undefined>,
    string
  >
}> {
  @observable screenType = AddTodoScreenType.add
  @observable vms: TodoVM[] = []
  breakdownTodo?: Todo
  @observable isBreakdown = false

  saveTodo() {
    const titlesToFixOrder = [] as string[]
    const addTodosOnTop = [] as Todo[]
    const addTodosToBottom = [] as Todo[]
    const involvedTodos = [] as Todo[]
    this.vms.forEach((vm, i) => {
      vm.order = i
    })
    for (const vm of this.vms) {
      if (this.screenType === AddTodoScreenType.add) {
        const todo = {
          updatedAt: new Date(),
          createdAt: new Date(),
          text: vm.text,
          completed: vm.completed,
          frog: vm.frog,
          frogFails: 0,
          skipped: false,
          order: vm.order,
          monthAndYear:
            vm.monthAndYear || getDateMonthAndYearString(new Date()),
          deleted: false,
          date: vm.date,
          time: vm.time,

          _tempSyncId: uuid(),
        } as Todo
        todo._exactDate = new Date(getTitle(todo))

        realm.write(() => {
          const dbtodo = realm.create(Todo, todo)
          involvedTodos.push(dbtodo)
        })

        titlesToFixOrder.push(getTitle(todo))
        if (vm.addOnTop) {
          addTodosOnTop.push(todo)
        } else {
          addTodosToBottom.push(todo)
        }
      } else if (vm.editedTodo) {
        const oldTitle = getTitle(vm.editedTodo)
        const failed = isTodoOld(vm.editedTodo)

        if (
          vm.editedTodo.frogFails > 2 &&
          (vm.editedTodo.monthAndYear !==
            (vm.monthAndYear || getDateMonthAndYearString(new Date())) ||
            vm.editedTodo.date !== vm.date)
        ) {
          setTimeout(() => {
            Alert.alert(translate('error'), translate('breakdownRequest'), [
              {
                text: translate('cancel'),
                style: 'cancel',
              },
              {
                text: translate('breakdownButton'),
                onPress: () => {
                  goBack()
                  navigate('BreakdownTodo', {
                    breakdownTodo: vm.editedTodo,
                  })
                },
              },
            ])
          }, 100)
          return
        }

        realm.write(() => {
          if (!vm.editedTodo) {
            return
          }
          vm.editedTodo.text = vm.text
          vm.editedTodo.completed = vm.completed
          vm.editedTodo.frog = vm.frog
          vm.editedTodo.monthAndYear =
            vm.monthAndYear || getDateMonthAndYearString(new Date())
          vm.editedTodo.date = vm.date
          vm.editedTodo.time = vm.time
          vm.editedTodo.updatedAt = new Date()
          vm.editedTodo._exactDate = new Date(getTitle(vm.editedTodo))
          if (failed) {
            vm.editedTodo.frogFails++
            if (vm.editedTodo.frogFails > 1) {
              vm.editedTodo.frog = true
            }
          }
        })
        involvedTodos.push(vm.editedTodo)
        titlesToFixOrder.push(oldTitle, getTitle(vm.editedTodo))
      }
    }
    if (this.breakdownTodo) {
      const breakdownTodoTitle = getTitle(this.breakdownTodo)
      realm.write(() => {
        if (!this.breakdownTodo) {
          return
        }
        this.breakdownTodo.completed = true
        this.breakdownTodo.updatedAt = new Date()
      })
      titlesToFixOrder.push(breakdownTodoTitle)
      sharedSessionStore.numberOfTodosCompleted++
    }
    // Add tags
    sharedTagStore.addTags(this.vms)
    // Sync todos
    fixOrder(titlesToFixOrder, addTodosOnTop, addTodosToBottom, involvedTodos)
    goBack()
    startConfetti()
  }

  @computed get isValid() {
    return this.vms.reduce((prev, cur) => {
      return !cur.isValid ? false : prev
    }, true)
  }

  componentDidMount() {
    if (this.props.route.params?.breakdownTodo) {
      this.breakdownTodo = this.props.route.params?.breakdownTodo
      this.isBreakdown = true
    }
    this.addTodo()
    if (this.props.route.params?.editedTodo) {
      this.vms[0].setEditedTodo(this.props.route.params.editedTodo)
      this.screenType = AddTodoScreenType.edit
    }
    addButtonStore.add = this.addTodo
  }

  addTodo = () => {
    this.vms.forEach((vm) => {
      vm.collapsed = true
    })
    const newVM = new TodoVM()
    if (this.breakdownTodo) {
      let matches = linkify.match(this.breakdownTodo.text) || []
      const newText = matches
        .map((v) =>
          /^#[\u0400-\u04FFa-zA-Z_0-9]+$/u.test(v.url) ? v.url : undefined
        )
        .filter((v) => !!v)
        .join(' ')
      newVM.text = newText
    }
    this.vms.push(newVM)
  }

  render() {
    return (
      <Container>
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          {this.isBreakdown && !!this.breakdownTodo && (
            <TodoCard todo={this.breakdownTodo} type={CardType.breakdown} />
          )}
          {this.vms.map((vm, i, a) => (
            <View key={i}>
              <AddTodoForm vm={vm} />
              {a.length > 1 && (
                <>
                  <Button
                    {...extraButtonProps(sharedColors)}
                    style={{
                      ...extraButtonProps(sharedColors).style,
                      marginHorizontal: 10,
                      justifyContent: 'center',
                      flex: 1,
                    }}
                    onPress={() => {
                      this.vms.splice(i, 1)
                    }}
                  >
                    <Text style={{ color: 'tomato' }}>
                      {translate('delete')}
                    </Text>
                  </Button>
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: sharedColors.specialSeparatorColor,
                    }}
                  />
                </>
              )}
            </View>
          ))}
          <Button
            block
            style={{ marginHorizontal: 10, marginTop: 10 }}
            onPress={() => {
              this.saveTodo()
            }}
            disabled={!this.isValid}
          >
            <Text>
              {this.screenType === AddTodoScreenType.add
                ? this.vms.length > 1
                  ? translate('addTodoPlural')
                  : translate('addTodoSingular')
                : translate('saveTodo')}
            </Text>
          </Button>
          {this.screenType === AddTodoScreenType.add && (
            <Button
              {...extraButtonProps(sharedColors)}
              style={{
                ...extraButtonProps(sharedColors).style,
                marginHorizontal: 10,
                marginTop: 10,
                flex: 1,
                justifyContent: 'center',
              }}
              onPress={() => {
                this.addTodo()
              }}
            >
              <Icon
                type="MaterialIcons"
                name="add"
                {...sharedColors.iconExtraStyle}
              />
            </Button>
          )}
        </Content>
      </Container>
    )
  }
}

export const AddTodo = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { editedTodo: Todo; breakdownTodo: Todo } | undefined>,
      string
    >
  >()
  return <AddTodoContent route={route} />
}
