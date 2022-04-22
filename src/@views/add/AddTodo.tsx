import * as Animatable from 'react-native-animatable'
import { ActionSheet, Text, Toast, View } from 'native-base'
import { AddTodoForm } from '@views/add/AddTodoForm'
import { AddTodoScreenType } from '@views/add/AddTodoScreenType'
import {
  Alert,
  BackHandler,
  Falsy,
  FlatList,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  NativeEventSubscription,
  Platform,
  StatusBar,
} from 'react-native'
import { Button } from '@components/Button'
import { CardType } from '@components/TodoCard/CardType'
import {
  Component,
  FC,
  createRef,
  memo,
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { Divider } from '@components/Divider'
import { EventEmitter } from 'events'
import { HeaderHeightContext } from '@react-navigation/elements'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Observer, observer, useLocalObservable } from 'mobx-react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TodoCard } from '@components/TodoCard'
import { TodoVM } from '@views/add/TodoVM'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { addButtonStore } from '@components/AddButton'
import { backButtonStore } from '@components/BackButton'
import {
  checkDayCompletionRoutine,
  shouldShowDayCompletionRoutine,
} from '@utils/dayCompleteRoutine'
import { compareTodosProps, getTitle } from '@models/Todo'
import { computed, makeObservable, observable } from 'mobx'
import { database, todosCollection } from '@utils/watermelondb/wmdb'
import { fixOrder } from '@utils/fixOrder'
import { getDateMonthAndYearString, isToday } from '@utils/time'
import { getLocalDelegation } from '@utils/delegations'
import { goBack, navigate } from '@utils/navigation'
import { isTodoOld } from '@utils/isTodoOld'
import { linkify } from '@utils/linkify'
import { logEvent } from '@utils/logEvent'
import { playFrogComplete, playTaskComplete } from '@utils/sound'
import { sharedColors } from '@utils/sharedColors'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'
import { startConfetti } from '@components/Confetti'
import { translate } from '@utils/i18n'
import Clipboard from '@react-native-community/clipboard'
import CustomIcon from '@components/CustomIcon'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import LinearGradient from 'react-native-linear-gradient'
import React from 'react'

export const addTodoEventEmitter = new EventEmitter()
export enum AddTodoEventEmitterEvent {
  saveTodo = 'saveTodo',
}

export let saveButtonNodeId: number
export let breakdownTodoNodeId: number

interface AddTodoContentProps {
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
}

export const AddTodoContent = memo<AddTodoContentProps>(
  (props) => {
    const mobxState = useLocalObservable(() => ({
      vms: [] as TodoVM[],
      screenType: AddTodoScreenType.add,
      isBreakdown: false,
      savingTodo: false,
    }))

    const addButtonView = useRef<Animatable.View>()

    let breakdownTodo: MelonTodo

    let completed = false

    const onboardingBreakdownTodos = useMemo(() => {
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
    }, [])

    const saveTodo = async () => {
      if (mobxState.savingTodo) {
        Toast.show({
          text: '🤔',
        })
        return
      }
      if (
        breakdownTodo &&
        !sharedOnboardingStore.tutorialIsShown &&
        mobxState.vms.length < 2
      ) {
        Keyboard.dismiss()
        sharedOnboardingStore.nextStep(TutorialStep.BreakdownLessThanTwo)
        return
      }
      mobxState.savingTodo = true
      const dayCompletinRoutineDoneInitially =
        await shouldShowDayCompletionRoutine()

      const titlesToFixOrder = [] as string[]
      const addTodosOnTop = [] as MelonTodo[]
      const addTodosToBottom = [] as MelonTodo[]
      const involvedTodos = [] as MelonTodo[]
      mobxState.vms.forEach((vm, i) => {
        vm.order = i
      })
      const completedAtCreation: string[] = []
      const toCreate = [] as MelonTodo[]
      const toUpdate = [] as MelonTodo[]
      for (const vm of mobxState.vms) {
        if (mobxState.screenType === AddTodoScreenType.add) {
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
            repetitive: vm.repetitive,
            encrypted: !!sharedSessionStore.encryptionKey && !vm.delegate,
          } as MelonTodo
          todo._exactDate = new Date(getTitle(todo))
          if (todo.completed) {
            completedAtCreation.push(todo.text)
          }
          let user: MelonUser | Falsy
          let delegator: MelonUser | Falsy
          if (vm.delegate) {
            user = await getLocalDelegation(vm.delegate, false)
            delegator = sharedSessionStore.user
              ? await getLocalDelegation(sharedSessionStore.user, true)
              : undefined
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

          const editedTodo = vm.editedTodo.prepareUpdateWithDescription(
            (todo) => {
              todo.text = vm.text
              todo.completed = vm.completed
              todo.frog = vm.frog
              todo.monthAndYear =
                vm.monthAndYear || getDateMonthAndYearString(new Date())
              todo.date = vm.date
              todo.time = vm.time
              todo.repetitive = vm.repetitive
              todo._exactDate = new Date(getTitle(todo))
              if (failed && todo.date) {
                todo.frogFails++
                if (todo.frogFails > 1) {
                  todo.frog = true
                }
              }
              todo.delegateAccepted = vm.delegateAccepted
            },
            'updating edited todo'
          )
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
      if (breakdownTodo) {
        const breakdownTodoTitle = getTitle(breakdownTodo)

        sharedTagStore.incrementEpicPoints(breakdownTodo.text)
        // Increment hero store
        sharedHeroStore.points++
        sharedHeroStore.updatedAt = new Date()

        if (breakdownTodo) {
          await breakdownTodo.complete('completing breakdown todo')
        }

        titlesToFixOrder.push(breakdownTodoTitle)
        sharedSessionStore.numberOfTodosCompleted++
        startConfetti()
      }
      // Play sounds
      const hasCompletedTodos =
        !!breakdownTodo ||
        mobxState.vms.reduce(
          (p, c) =>
            (c.editedTodo && c.editedTodo.completed) || c.completed || p,
          false as boolean
        )
      const hasFrog =
        (!!breakdownTodo && breakdownTodo.frog) ||
        mobxState.vms.reduce(
          (p, c) => (c.editedTodo && c.editedTodo.frog) || c.frog || p,
          false as boolean
        )
      if (hasCompletedTodos && !completed) {
        if (hasFrog) {
          playFrogComplete()
        } else {
          playTaskComplete()
        }
      }
      goBack()
      // Add tags
      await sharedTagStore.addTags(mobxState.vms, false)
      // Sync todos
      await fixOrder(
        titlesToFixOrder,
        addTodosOnTop,
        addTodosToBottom,
        involvedTodos
      )
      if (breakdownTodo && !dayCompletinRoutineDoneInitially) {
        checkDayCompletionRoutine()
      }
      if (!sharedOnboardingStore.tutorialIsShown) {
        sharedOnboardingStore.nextStep()
      }
      Keyboard.dismiss()
      // Sync hero
      sharedSync.sync(SyncRequestEvent.Hero)
    }

    const isValid = () => {
      return mobxState.vms.reduce((prev, cur) => {
        return !cur.isValid ? false : prev
      }, true)
    }

    useEffect(() => {
      logEvent('add_todo_opened')
      backButtonStore.back = onBackPress
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          return onBackPress(true)
        }
      )
      if (props.route.params?.breakdownTodo) {
        breakdownTodo = props.route.params?.breakdownTodo
        mobxState.isBreakdown = true
      }
      if (
        !sharedOnboardingStore.tutorialIsShown &&
        sharedOnboardingStore.step === TutorialStep.Breakdown
      ) {
        mobxState.vms.push(...onboardingBreakdownTodos)
      } else {
        addTodo()
      }
      if (props.route.params?.editedTodo) {
        completed = props.route.params?.editedTodo.completed
        mobxState.vms[0].setEditedTodo(props.route.params.editedTodo)
        mobxState.screenType = AddTodoScreenType.edit
      }
      addButtonStore.add = addTodo
      if (props.route.params?.text) {
        mobxState.vms[0].text = props.route.params?.text
      }
      InteractionManager.runAfterInteractions(() => {
        if (sharedOnboardingStore.step === TutorialStep.Breakdown) {
          sharedOnboardingStore.nextStep()
        }
      })
      addTodoEventEmitter.on(AddTodoEventEmitterEvent.saveTodo, () => {
        saveTodo()
      })
      return backHandler.remove()
    }, [])

    const flatlistref = useRef<FlatList>()

    const addTodo = async () => {
      mobxState.vms.forEach((vm) => {
        vm.collapsed = true
      })
      const newVM = new TodoVM()
      if (breakdownTodo) {
        if (mobxState.vms.length === 0 && breakdownTodo.repetitive) {
          newVM.text = breakdownTodo.text
          newVM.time = breakdownTodo.time
        } else if (sharedSettingsStore.duplicateTagInBreakdown) {
          const matches = linkify.match(breakdownTodo.text) || []
          const newText = matches
            .map((v) =>
              /^#[\u0400-\u04FFa-zA-Z_0-9]+$/u.test(v.url) ? v.url : undefined
            )
            .filter((v) => !!v)
            .join(' ')
          newVM.text = newText
        }
        newVM.repetitive = breakdownTodo.repetitive
      }
      if (props.route.params?.date) {
        newVM.monthAndYear = props.route.params?.date.substr(0, 7)
        newVM.date = props.route.params?.date.substr(8, 2)
      }
      mobxState.vms.push(newVM)

      if (flatlistref) {
        InteractionManager.runAfterInteractions(async () => {
          await flatlistref.current?.scrollToEnd()
          newVM.focus()
        })
      }
    }

    const isDirty = () => {
      for (const vm of mobxState.vms) {
        if (vm.editedTodo) {
          if (
            vm.editedTodo?.text != vm.text ||
            vm.editedTodo?.completed != vm.completed ||
            vm.editedTodo?.frog != vm.frog ||
            vm.editedTodo?.monthAndYear != vm.monthAndYear ||
            vm.editedTodo?.date != vm.date ||
            vm.editedTodo?.time != vm.time ||
            vm.editedTodo?.repetitive != vm.repetitive
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
          vm.time ||
          vm.repetitive
        ) {
          if (
            !(vm.text || vm.completed || vm.frog || vm.time || vm.repetitive) &&
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

    const onBackPress = (isHardware = false) => {
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
      if (!isDirty()) {
        if (isHardware) {
          // Do nothing
        } else {
          goBack()
        }
      } else {
        const options = [
          translate(
            mobxState.vms.length > 1 ? 'dissmissTasks' : 'dissmissTasksSingular'
          ),
          translate(
            isValid()
              ? mobxState.vms.length > 1
                ? 'changeTasks'
                : 'changeTasksSingular'
              : mobxState.vms.length > 1
              ? 'fixTasks'
              : 'fixTasksSingular'
          ),
        ]
        if (isValid()) {
          options.splice(
            0,
            0,
            translate(
              mobxState.vms.length > 1 ? 'saveTasks' : 'saveTasksSingular'
            )
          )
        }

        ActionSheet.show(
          {
            options: options,
            cancelButtonIndex: 0,
            destructiveButtonIndex: 1,
            title: translate(
              isValid()
                ? mobxState.vms.length > 1
                  ? 'dirtyValidSave'
                  : 'dirtyValidSaveSingular'
                : mobxState.vms.length > 1
                ? 'dirtyInvalidSave'
                : 'dirtyInvalidSaveSingular'
            ),
          },
          (buttonIndex) => {
            if (isValid()) {
              if (buttonIndex === 0) {
                saveTodo()
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

    const onDragEnd = ({
      from,
      to,
    }: {
      data: (undefined | TodoVM)[]
      from: number
      to: number
    }) => {
      if (from == 0 || to == 0) {
        return
      }
      from--
      to--
      // Get the dragged item
      const draggedItem = mobxState.vms[from]
      mobxState.vms[from] = mobxState.vms[to]
      mobxState.vms[to] = draggedItem
    }

    return (
      <Observer>
        {() => (
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
                  ? (StatusBar.currentHeight || 0) + (props.headerHeight || 0)
                  : undefined
              }
            >
              <DraggableFlatList
                ref={flatlistref}
                contentContainerStyle={{
                  paddingBottom: 10,
                  paddingTop: 10,
                }}
                style={{ maxHeight: '95%', height: '95%' }}
                autoscrollSpeed={200}
                data={[undefined, ...mobxState.vms]}
                renderItem={({ item, index, drag }) => {
                  return index == 0 ? (
                    mobxState.isBreakdown && !!breakdownTodo && (
                      <View
                        onLayout={({ nativeEvent: { target } }: any) => {
                          breakdownTodoNodeId = target
                        }}
                      >
                        <TodoCard
                          todo={breakdownTodo}
                          type={CardType.breakdown}
                        />
                      </View>
                    )
                  ) : (
                    <ScaleDecorator>
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
                              mobxState.vms.length > 1
                                ? () => {
                                    if (index) {
                                      mobxState.vms.splice(index - 1, 1)
                                    }
                                  }
                                : undefined
                            }
                            drag={drag}
                            showCross={
                              !!breakdownTodo &&
                              !!sharedSettingsStore.duplicateTagInBreakdown
                            }
                          />
                        )}
                        {index != mobxState.vms.length && <Divider />}
                      </View>
                    </ScaleDecorator>
                  )
                }}
                keyExtractor={(item, index) => `draggable-item-${index}`}
                onDragEnd={onDragEnd}
              />
              <View
                style={{
                  marginTop: -40,
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
                  ref={addButtonView}
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
                      if (!isValid() || mobxState.savingTodo) {
                        if (addButtonView && addButtonView.current?.shake) {
                          mobxState.vms.forEach((vm) => {
                            if (!vm.isValid) {
                              vm.collapsed = false
                            }
                          })
                          mobxState.vms.forEach((vm) => {
                            if (!vm.isValid) {
                              vm.shakeInvalid()
                            }
                          })
                          addButtonView.current?.shake(1000)
                        }
                      } else {
                        saveTodo()
                      }
                    }}
                    onLongPress={() => {
                      Clipboard.setString(
                        JSON.stringify(props.route.params?.editedTodo)
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
                          !isValid() || mobxState.savingTodo
                            ? 'grey'
                            : undefined,
                      }}
                      onPress={() => {
                        if (!isValid() || mobxState.savingTodo) {
                          if (addButtonView && addButtonView.current?.shake) {
                            mobxState.vms.forEach((vm) => {
                              if (!vm.isValid) {
                                vm.collapsed = false
                              }
                            })
                            mobxState.vms.forEach((vm) => {
                              if (!vm.isValid) {
                                vm.shakeInvalid()
                              }
                            })
                            addButtonView.current?.shake(1000)
                          }
                        } else {
                          saveTodo()
                        }
                      }}
                      onLongPress={() => {
                        Clipboard.setString(
                          JSON.stringify(props.route.params?.editedTodo)
                        )
                        Toast.show({
                          text: translate('copied'),
                        })
                      }}
                    >
                      <Text>
                        {mobxState.screenType === AddTodoScreenType.add
                          ? mobxState.vms.length > 1
                            ? translate('addTodoPlural')
                            : translate('addTodoSingular')
                          : translate('saveTodo')}
                      </Text>
                    </Button>
                  </TouchableOpacity>
                </Animatable.View>
                {mobxState.screenType === AddTodoScreenType.add && (
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
                        addTodo()
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
                        <CustomIcon
                          name="add_outline_28"
                          size={20}
                          color="white"
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Observer>
    )
  },
  (prevProps, nextProps) => {
    const { params: nextParams } = nextProps.route
    const { params: prevParams } = prevProps.route
    return (
      prevParams?.text === nextParams?.text &&
      prevParams?.delegateId === nextParams?.delegateId &&
      prevParams?.date === nextParams?.delegateId &&
      compareTodosProps(prevParams?.breakdownTodo, nextParams?.breakdownTodo) &&
      compareTodosProps(prevParams?.editedTodo, nextParams?.editedTodo) &&
      prevProps.headerHeight === nextProps.headerHeight
    )
  }
)

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
