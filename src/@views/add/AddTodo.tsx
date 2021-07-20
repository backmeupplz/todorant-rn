import React, { Component } from 'react'
import { Text, View, Toast, ActionSheet } from 'native-base'
import { goBack, navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { observable, computed, makeObservable } from 'mobx'
import { getDateMonthAndYearString, isToday } from '@utils/time'
import { Todo, getTitle, cloneDelegator } from '@models/Todo'
import { fixOrder } from '@utils/fixOrder'
import uuid from 'uuid'
import { useRoute, RouteProp } from '@react-navigation/native'
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
import {
  Alert,
  Clipboard,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  InteractionManager,
  NativeEventSubscription,
} from 'react-native'
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
import { backButtonStore } from '@components/BackButton'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { logEvent } from '@utils/logEvent'
import { HeaderHeightContext } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Animatable from 'react-native-animatable'
import { isTodoOld } from '@utils/isTodoOld'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { pick } from 'lodash'
import { DelegationUser } from '@models/DelegationUser'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { EventEmitter } from 'events'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { database, todosCollection } from '@utils/wmdb'
import { updateOrCreateDelegation } from '@utils/delegations'

export const addTodoEventEmitter = new EventEmitter()
export enum AddTodoEventEmitterEvent {
  saveTodo = 'saveTodo',
}

export let saveButtonNodeId: number
export let breakdownTodoNodeId: number

@observer
class AddTodoContent extends Component<{
  route: RouteProp<
    Record<
      string,
      | {
          editedTodo?: MelonTodo
          breakdownTodo?: MelonTodo
          date?: string
          text?: string
          delegateId?: string
        }
      | undefined
    >,
    string
  >
  headerHeight?: number
}> {
  @observable screenType = AddTodoScreenType.add
  @observable vms: TodoVM[] = []
  breakdownTodo?: MelonTodo
  @observable isBreakdown = false

  @observable savingTodo = false

  backHandler: NativeEventSubscription | undefined

  scrollView: DraggableFlatList<TodoVM | undefined> | null = null

  completed = false

  addButtonView?: Animatable.View
  hangleAddButtonViewRef = (ref: any) => (this.addButtonView = ref)

  get onboardingBreakdownTodos() {
    const firstTodo = new TodoVM()
    const secondTodo = new TodoVM()
    const thirdTodo = new TodoVM()
    firstTodo.text = translate('onboarding.breakdownTodo1')
    secondTodo.text = translate('onboarding.breakdownTodo2')
    thirdTodo.text = translate('onboarding.breakdownTodo3')
    firstTodo.collapsed = true
    secondTodo.collapsed = true
    thirdTodo.collapsed = true
    return [firstTodo, secondTodo, thirdTodo]
  }

  async saveTodo() {
    if (this.savingTodo) {
      Toast.show({
        text: '🤔',
      })
      return
    }
    if (
      this.breakdownTodo &&
      !sharedOnboardingStore.tutorialIsShown &&
      this.vms.length < 2
    ) {
      Keyboard.dismiss()
      sharedOnboardingStore.nextStep(TutorialStep.BreakdownLessThanTwo)
      return
    }
    this.savingTodo = true
    const dayCompletinRoutineDoneInitially = shouldShowDayCompletionRoutine()

    const titlesToFixOrder = [] as string[]
    const addTodosOnTop = [] as MelonTodo[]
    const addTodosToBottom = [] as MelonTodo[]
    const involvedTodos = [] as MelonTodo[]
    this.vms.forEach((vm, i) => {
      vm.order = i
    })
    const completedAtCreation: string[] = []
    const toCreate = [] as MelonTodo[]
    const toUpdate = [] as MelonTodo[]
    for (const vm of this.vms) {
      if (this.screenType === AddTodoScreenType.add) {
        const todo = {
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
          //user: !!vm.delegate ? cloneDelegator(vm.delegate) : undefined,
          //delegator: !!vm.delegate
          //  ? cloneDelegator(sharedSessionStore.user)
          //  : undefined,
          encrypted: !!sharedSessionStore.encryptionKey && !vm.delegate,
        } as Todo
        todo._exactDate = new Date(getTitle(todo))
        if (todo.completed) {
          completedAtCreation.push(todo.text)
        }
        let user: MelonUser | undefined
        let delegator: MelonUser | undefined
        if (vm.delegate) {
          user = await updateOrCreateDelegation(vm.delegate, false, true)
          delegator = await updateOrCreateDelegation(
            sharedSessionStore.user,
            true,
            true
          )
        }
        const dbtodo = todosCollection.prepareCreate((dbtodo) => {
          Object.assign(dbtodo, todo)
          if (user && delegator) {
            dbtodo.delegator?.set(delegator)
            dbtodo.user?.set(user)
          }
        })
        toCreate.push(dbtodo)
        involvedTodos.push(dbtodo)
        titlesToFixOrder.push(getTitle(dbtodo))
        if (vm.addOnTop) {
          addTodosOnTop.push(dbtodo)
        } else {
          addTodosToBottom.push(dbtodo)
        }
      } else if (vm.editedTodo) {
        const oldTitle = getTitle(vm.editedTodo)
        const failed =
          isTodoOld(vm.editedTodo) &&
          (vm.editedTodo.date !== vm.date ||
            vm.editedTodo.monthAndYear !== vm.monthAndYear) &&
          !vm.editedTodo.completed

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

        if (vm.completed && !vm.editedTodo.completed) {
          completedAtCreation.push(vm.text)
        }

        const editedTodo = vm.editedTodo.prepareUpdate((todo) => {
          todo.text = vm.text
          todo.completed = vm.completed
          todo.frog = vm.frog
          todo.monthAndYear =
            vm.monthAndYear || getDateMonthAndYearString(new Date())
          todo.date = vm.date
          todo.time = vm.time
          todo._exactDate = new Date(getTitle(vm.editedTodo!))
          if (failed && todo.date) {
            todo.frogFails++
            if (todo.frogFails > 1) {
              todo.frog = true
            }
          }
          todo.delegateAccepted = vm.delegateAccepted
        })
        toUpdate.push(editedTodo)
        involvedTodos.push(editedTodo)
        titlesToFixOrder.push(oldTitle, getTitle(editedTodo))
      }
    }
    await database.write(
      async () => await database.batch(...toCreate, ...toUpdate)
    )
    completedAtCreation.forEach((todoText) => {
      sharedTagStore.incrementEpicPoints(todoText)
      // Increment hero store
      sharedHeroStore.points++
      sharedHeroStore.updatedAt = new Date()
    })
    completedAtCreation.splice(0, completedAtCreation.length)
    if (this.breakdownTodo) {
      const breakdownTodoTitle = getTitle(this.breakdownTodo)

      sharedTagStore.incrementEpicPoints(this.breakdownTodo.text)
      // Increment hero store
      sharedHeroStore.points++
      sharedHeroStore.updatedAt = new Date()

      if (this.breakdownTodo) {
        await this.breakdownTodo.complete()
      }

      titlesToFixOrder.push(breakdownTodoTitle)
      sharedSessionStore.numberOfTodosCompleted++
      startConfetti()
    }
    // Play sounds
    const hasCompletedTodos =
      !!this.breakdownTodo ||
      this.vms.reduce(
        (p, c) => (c.editedTodo && c.editedTodo.completed) || c.completed || p,
        false as boolean
      )
    const hasFrog =
      (!!this.breakdownTodo && this.breakdownTodo.frog) ||
      this.vms.reduce(
        (p, c) => (c.editedTodo && c.editedTodo.frog) || c.frog || p,
        false as boolean
      )
    if (hasCompletedTodos && !this.completed) {
      if (hasFrog) {
        playFrogComplete()
      } else {
        playTaskComplete()
      }
    }
    // Add tags
    await sharedTagStore.addTags(this.vms)
    // Sync todos
    await fixOrder(
      titlesToFixOrder,
      addTodosOnTop,
      addTodosToBottom,
      involvedTodos
    )
    goBack()
    if (this.breakdownTodo && !dayCompletinRoutineDoneInitially) {
      checkDayCompletionRoutine()
    }
    if (!sharedOnboardingStore.tutorialIsShown) {
      sharedOnboardingStore.nextStep()
    }
    Keyboard.dismiss()
    // Sync hero
    sharedSync.sync(SyncRequestEvent.Hero)
  }

  @computed get isValid() {
    return this.vms.reduce((prev, cur) => {
      return !cur.isValid ? false : prev
    }, true)
  }

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    logEvent('add_todo_opened')
    backButtonStore.back = this.onBackPress
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return this.onBackPress(true)
    })
    if (this.props.route.params?.breakdownTodo) {
      this.breakdownTodo = this.props.route.params?.breakdownTodo
      this.isBreakdown = true
    }
    if (
      !sharedOnboardingStore.tutorialIsShown &&
      sharedOnboardingStore.step === TutorialStep.Breakdown
    ) {
      this.vms.push(...this.onboardingBreakdownTodos)
    } else {
      this.addTodo()
    }
    if (this.props.route.params?.editedTodo) {
      this.completed = this.props.route.params?.editedTodo.completed
      this.vms[0].setEditedTodo(this.props.route.params.editedTodo)
      this.screenType = AddTodoScreenType.edit
    }
    addButtonStore.add = this.addTodo
    if (this.props.route.params?.text) {
      this.vms[0].text = this.props.route.params?.text
    }
    InteractionManager.runAfterInteractions(() => {
      if (sharedOnboardingStore.step === TutorialStep.Breakdown) {
        sharedOnboardingStore.nextStep()
      }
    })
    addTodoEventEmitter.on(AddTodoEventEmitterEvent.saveTodo, () => {
      this.saveTodo()
    })
  }

  componentWillUnmount() {
    this.backHandler?.remove()
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

    if (this.scrollView && Platform.OS === 'ios') {
      this.scrollView.scrollToAsync(Number.MAX_SAFE_INTEGER)
    }
  }

  isDirty = () => {
    for (let vm of this.vms) {
      if (vm.editedTodo) {
        if (
          vm.editedTodo?.text != vm.text ||
          vm.editedTodo?.completed != vm.completed ||
          vm.editedTodo?.frog != vm.frog ||
          vm.editedTodo?.monthAndYear != vm.monthAndYear ||
          vm.editedTodo?.date != vm.date ||
          vm.editedTodo?.time != vm.time
        ) {
          return true
        }
      } else if (
        vm.text ||
        vm.addOnTop ||
        vm.completed ||
        vm.frog ||
        vm.monthAndYear ||
        vm.date ||
        vm.time
      ) {
        if (
          !(vm.text || vm.completed || vm.frog || vm.time) &&
          vm.monthAndYear &&
          vm.date &&
          isToday(vm.monthAndYear, vm.date)
        ) {
          continue
        }
        return true
      }
    }
    return false
  }

  onBackPress = (isHardware = false) => {
    if (!sharedOnboardingStore.tutorialIsShown) {
      if (
        sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction ||
        sharedOnboardingStore.step === TutorialStep.BreakdownTodo
      ) {
        sharedOnboardingStore.nextStep(TutorialStep.BreakdownLessThanTwo)
      } else {
        sharedOnboardingStore.nextStep(TutorialStep.Close)
      }
      Keyboard.dismiss()
      return true
    }
    if (!this.isDirty()) {
      if (isHardware) {
        // Do nothing
      } else {
        goBack()
      }
    } else {
      const options = [
        translate(
          this.vms.length > 1 ? 'dissmissTasks' : 'dissmissTasksSingular'
        ),
        translate(
          this.isValid
            ? this.vms.length > 1
              ? 'changeTasks'
              : 'changeTasksSingular'
            : this.vms.length > 1
            ? 'fixTasks'
            : 'fixTasksSingular'
        ),
      ]
      if (this.isValid) {
        options.splice(
          0,
          0,
          translate(this.vms.length > 1 ? 'saveTasks' : 'saveTasksSingular')
        )
      }

      ActionSheet.show(
        {
          options: options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
          title: translate(
            this.isValid
              ? this.vms.length > 1
                ? 'dirtyValidSave'
                : 'dirtyValidSaveSingular'
              : this.vms.length > 1
              ? 'dirtyInvalidSave'
              : 'dirtyInvalidSaveSingular'
          ),
        },
        (buttonIndex) => {
          if (this.isValid) {
            if (buttonIndex === 0) {
              this.saveTodo()
            } else if (buttonIndex === 1) {
              goBack()
            }
          } else {
            if (buttonIndex === 0) {
              goBack()
            }
          }
        }
      )
      return true
    }
  }

  onDragEnd = ({ data, from, to }: { data: any; from: number; to: number }) => {
    if (from == 0 || to == 0) {
      return
    }
    from--
    to--
    // Get the dragged item
    const draggedItem = this.vms[from]
    this.vms[from] = this.vms[to]
    this.vms[to] = draggedItem
  }

  render() {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        {...{ edges: ['left', 'bottom', 'right'] }}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={
            Platform.OS === 'ios'
              ? (StatusBar.currentHeight || 0) + (this.props.headerHeight || 0)
              : undefined
          }
        >
          <DraggableFlatList
            ref={(scrollView) => {
              this.scrollView = scrollView
            }}
            contentContainerStyle={{ paddingBottom: 10, paddingTop: 10 }}
            autoscrollSpeed={200}
            data={[undefined, ...this.vms]}
            renderItem={({ item, index, drag, isActive }) => {
              return index == 0 ? (
                this.isBreakdown && !!this.breakdownTodo && (
                  <View
                    onLayout={({ nativeEvent: { target } }: any) => {
                      breakdownTodoNodeId = target
                    }}
                  >
                    <TodoCard
                      todo={this.breakdownTodo}
                      type={CardType.breakdown}
                    />
                  </View>
                )
              ) : (
                <View
                  key={index}
                  style={{
                    marginTop: index === 0 ? 10 : undefined,
                  }}
                >
                  {item && (
                    <AddTodoForm
                      vm={item}
                      deleteTodo={
                        this.vms.length > 1
                          ? () => {
                              if (index) {
                                this.vms.splice(index - 1, 1)
                              }
                            }
                          : undefined
                      }
                      drag={drag}
                      showCross={
                        !!this.breakdownTodo &&
                        !!sharedSettingsStore.duplicateTagInBreakdown
                      }
                    />
                  )}
                  {index != this.vms.length && <Divider />}
                </View>
              )
            }}
            keyExtractor={(item, index) => `draggable-item-${index}`}
            onDragEnd={this.onDragEnd}
          />
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <Animatable.View
              style={{
                borderRadius: 10,
                marginRight: 10,
                marginVertical: 10,
                flexGrow: 1,
                overflow: 'hidden',
              }}
              ref={this.hangleAddButtonViewRef}
            >
              <TouchableOpacity
                onLayout={({ nativeEvent: { target } }: any) => {
                  saveButtonNodeId = target
                }}
                disabled={
                  !sharedOnboardingStore.tutorialIsShown &&
                  !(
                    sharedOnboardingStore.step ===
                      TutorialStep.AddTodoComplete ||
                    sharedOnboardingStore.step ===
                      TutorialStep.BreakdownTodoAction
                  )
                }
                onPress={() => {
                  if (!this.isValid || this.savingTodo) {
                    if (this.addButtonView && this.addButtonView.shake) {
                      this.vms.forEach((vm) => {
                        if (!vm.isValid) {
                          vm.collapsed = false
                        }
                      })
                      this.vms.forEach((vm) => {
                        if (!vm.isValid) {
                          vm.shakeInvalid()
                        }
                      })
                      this.addButtonView.shake(1000)
                    }
                  } else {
                    this.saveTodo()
                  }
                }}
                onLongPress={() => {
                  Clipboard.setString(
                    JSON.stringify(this.props.route.params?.editedTodo)
                  )
                  Toast.show({
                    text: translate('copied'),
                  })
                }}
              >
                <Button
                  style={{
                    borderRadius: 10,
                    justifyContent: 'center',
                    backgroundColor:
                      !this.isValid || this.savingTodo ? 'grey' : undefined,
                  }}
                  onPress={() => {
                    if (!this.isValid || this.savingTodo) {
                      if (this.addButtonView && this.addButtonView.shake) {
                        this.vms.forEach((vm) => {
                          if (!vm.isValid) {
                            vm.collapsed = false
                          }
                        })
                        this.vms.forEach((vm) => {
                          if (!vm.isValid) {
                            vm.shakeInvalid()
                          }
                        })
                        this.addButtonView.shake(1000)
                      }
                    } else {
                      this.saveTodo()
                    }
                  }}
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
              </TouchableOpacity>
            </Animatable.View>
            {this.screenType === AddTodoScreenType.add && (
              <View
                style={{
                  aspectRatio: 1,
                  marginVertical: 10,
                  flexShrink: 1,
                }}
              >
                <TouchableOpacity
                  disabled={
                    !sharedOnboardingStore.tutorialIsShown &&
                    !(
                      sharedOnboardingStore.step ===
                      TutorialStep.BreakdownTodoAction
                    )
                  }
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }
}

export const AddTodo = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        | {
            editedTodo?: MelonTodo
            breakdownTodo?: MelonTodo
            date?: string
            text?: string
          }
        | undefined
      >,
      string
    >
  >()
  return (
    <HeaderHeightContext.Consumer>
      {(headerHeight) => (
        <AddTodoContent route={route} headerHeight={headerHeight} />
      )}
    </HeaderHeightContext.Consumer>
  )
}
