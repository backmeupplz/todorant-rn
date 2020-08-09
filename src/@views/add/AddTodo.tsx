import React, { Component } from 'react'
import { Container, Content, Text, View, Toast } from 'native-base'
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
import { addButtonStore } from '@components/AddButton'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { linkify } from '@utils/linkify'
import { sharedTagStore } from '@stores/TagStore'
import { TodoVM } from '@views/add/TodoVM'
import { AddTodoScreenType } from '@views/add/AddTodoScreenType'
import { AddTodoForm } from '@views/add/AddTodoForm'
import { Alert, Clipboard } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import { Button } from '@components/Button'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { startConfetti } from '@components/Confetti'
import { playFrogComplete, playTaskComplete } from '@utils/sound'
import {
  checkDayCompletionRoutine,
  shouldShowDayCompletionRoutine,
} from '@utils/dayCompleteRoutine'
import { sharedHeroStore } from '@stores/HeroStore'
import { Divider } from '@components/Divider'
import LinearGradient from 'react-native-linear-gradient'
import { TouchableOpacity } from 'react-native-gesture-handler'
import CustomIcon from '@components/CustomIcon'
import { sockets } from '@utils/sockets'

@observer
class AddTodoContent extends Component<{
  route: RouteProp<
    Record<
      string,
      { editedTodo: Todo; breakdownTodo: Todo; date: string } | undefined
    >,
    string
  >
}> {
  @observable screenType = AddTodoScreenType.add
  @observable vms: TodoVM[] = []
  breakdownTodo?: Todo
  @observable isBreakdown = false

  saveTodo() {
    const dayCompletinRoutineDoneInitially = shouldShowDayCompletionRoutine()

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
          encrypted: !!sharedSessionStore.encryptionKey,

          _tempSyncId: uuid(),
        } as Todo
        todo._exactDate = new Date(getTitle(todo))

        if (todo.completed) {
          sharedTagStore.incrementEpicPoints(todo.text)
          // Increment hero store
          sharedHeroStore.points++
          sharedHeroStore.updatedAt = new Date()
        }

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

        if (vm.completed) {
          sharedTagStore.incrementEpicPoints(vm.text)
          // Increment hero store
          sharedHeroStore.points++
          sharedHeroStore.updatedAt = new Date()
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
      if (this.breakdownTodo.frog) {
        playFrogComplete()
      } else {
        playTaskComplete()
      }

      sharedTagStore.incrementEpicPoints(this.breakdownTodo.text)
      // Increment hero store
      sharedHeroStore.points++
      sharedHeroStore.updatedAt = new Date()

      realm.write(() => {
        if (!this.breakdownTodo) {
          return
        }
        this.breakdownTodo.completed = true
        this.breakdownTodo.updatedAt = new Date()
      })
      titlesToFixOrder.push(breakdownTodoTitle)
      sharedSessionStore.numberOfTodosCompleted++
      startConfetti()
    }
    // Add tags
    sharedTagStore.addTags(this.vms)
    // Sync todos
    fixOrder(titlesToFixOrder, addTodosOnTop, addTodosToBottom, involvedTodos)
    goBack()
    if (this.breakdownTodo && !dayCompletinRoutineDoneInitially) {
      checkDayCompletionRoutine()
    }
    // Sync hero
    sockets.heroSyncManager.sync()
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
      if (sharedSettingsStore.duplicateTagInBreakdown) {
        let matches = linkify.match(this.breakdownTodo.text) || []
        const newText = matches
          .map((v) =>
            /^#[\u0400-\u04FFa-zA-Z_0-9]+$/u.test(v.url) ? v.url : undefined
          )
          .filter((v) => !!v)
          .join(' ')
        newVM.text = newText
      }
    }
    if (this.props.route.params?.date) {
      newVM.monthAndYear = this.props.route.params?.date.substr(0, 7)
      newVM.date = this.props.route.params?.date.substr(8, 2)
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
            <View key={i} style={{ marginTop: i === 0 ? 10 : undefined }}>
              <AddTodoForm
                vm={vm}
                deleteTodo={
                  a.length > 1
                    ? () => {
                        this.vms.splice(i, 1)
                      }
                    : undefined
                }
              />
              {i < a.length - 1 && <Divider />}
            </View>
          ))}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                marginRight: 10,
                marginVertical: 10,
                flexGrow: 1,
              }}
            >
              <Button
                style={{ borderRadius: 10, justifyContent: 'center' }}
                onPress={() => {
                  this.saveTodo()
                }}
                disabled={!this.isValid}
                onLongPress={() => {
                  Clipboard.setString(
                    JSON.stringify(this.props.route.params?.editedTodo)
                  )
                  Toast.show({
                    text: translate('copied'),
                  })
                }}
              >
                <Text>
                  {this.screenType === AddTodoScreenType.add
                    ? this.vms.length > 1
                      ? translate('addTodoPlural')
                      : translate('addTodoSingular')
                    : translate('saveTodo')}
                </Text>
              </Button>
            </View>
            {this.screenType === AddTodoScreenType.add && (
              <View
                style={{
                  aspectRatio: 1,
                  marginVertical: 10,
                  flexShrink: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.addTodo()
                  }}
                >
                  <LinearGradient
                    colors={['#1148B9', '#5C9BFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      backgroundColor:
                        'linear-gradient(126.87deg, #1148B9 0%, #5C9BFF 100%)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                    }}
                  >
                    <CustomIcon name="add_outline_28" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Content>
      </Container>
    )
  }
}

export const AddTodo = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        { editedTodo: Todo; breakdownTodo: Todo; date: string } | undefined
      >,
      string
    >
  >()
  return <AddTodoContent route={route} />
}
