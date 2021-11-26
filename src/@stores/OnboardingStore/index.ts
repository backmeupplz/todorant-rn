import { Step } from '@stores/OnboardingStore/Step'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { translate } from '@utils/i18n'
import { rootRef } from '../../../App'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import {
  Dimensions,
  findNodeHandle,
  InteractionManager,
  Linking,
  StyleProp,
  ViewStyle,
  Platform,
  Keyboard,
} from 'react-native'
import { RNHole } from '@upacyxou/react-native-hole-view'
import Animated, { Easing } from 'react-native-reanimated'
import { EasingNode } from 'react-native-reanimated'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { navigate } from '@utils/navigation'
import { Toast } from 'native-base'
import { startConfetti } from '@components/Confetti'
import { logEvent } from '@utils/logEvent'
import { measurePosition } from '@stores/OnboardingStore/measurePosition'
import { settingsScrollOffset } from '@utils/settingsScrollOffset'
import { OnboardingSreens } from '@stores/OnboardingStore/Screen'
import { OnboardingButton } from './MessageBoxButton'
import { sharedTodoStore } from '@stores/TodoStore'
import {
  addTodoEventEmitter,
  AddTodoEventEmitterEvent,
} from '@views/add/AddTodo'

class OnboardingStore {
  constructor() {
    makeObservable(this)
  }

  @observable hydrated = false

  defaultHole: RNHole = {
    x: Dimensions.get('window').width / 2,
    y: Dimensions.get('window').height / 2,
    width: 0,
    height: 0,
    borderRadius: 0,
  }

  messageBoxId: number | undefined
  animatedOpacity = new Animated.Value(1)
  tutorialStepAsArray = Array.from(Object.values(TutorialStep))
  currentHole: undefined | RNHole = undefined

  @observable stepObject: Step = {
    messageBoxPosition: 'center',
    notShowClose: true,
    additionalButtons: [
      new OnboardingButton(
        () => sharedOnboardingStore.nextStep(TutorialStep.Close),
        'closeButtonText'
      ),
    ],
  }

  @persist @observable screen: OnboardingSreens = OnboardingSreens.Current
  @persist @observable savedStep?: TutorialStep
  @observable messageBoxAppear = true
  @observable step = TutorialStep.Start
  @observable previousStep = TutorialStep.Start
  @persist @observable tutorialIsShown = false

  @observable textInTodo?: string

  @computed get closeOnboardingStyle() {
    const basicStyle = {
      alignSelf: 'flex-end',
      position: 'absolute',
      zIndex: 1,
      padding: 12,
    } as StyleProp<ViewStyle>
    return this.step === TutorialStep.AddAnotherTask ||
      this.step === TutorialStep.ExplainSearchAndCompleted
      ? Object.assign(basicStyle, { bottom: 0 })
      : Object.assign(basicStyle, { top: 0 })
  }

  buildRnHole(
    { x, y, width, height }: RNHole,
    divider = 2,
    borderRadius = Platform.OS === 'android' ? 128 : 32,
    heightMultiplier = 1
  ) {
    const halfOfHeight = height / divider
    const halfOfWidth = width / divider
    height += halfOfHeight * heightMultiplier
    width += halfOfWidth
    x -= halfOfWidth / 2
    y -= (halfOfHeight * heightMultiplier) / 2
    return { height, width, x, y, borderRadius }
  }

  changeSavedSreen(screen: OnboardingSreens) {
    requestAnimationFrame(() => {
      navigate(screen)
      this.screen = screen
    })
  }

  changeStepAndHole(
    step: TutorialStep,
    hole: RNHole = this.defaultHole,
    stepObject?: Step
  ) {
    requestAnimationFrame(() => {
      logEvent(step)
      this.currentHole = hole
      Animated.timing(this.animatedOpacity, {
        toValue: 0,
        duration: 250,
        easing: EasingNode.linear,
      }).start(() => {
        this.step = step
        if (stepObject) {
          this.stepObject = stepObject
        }
        Animated.timing(this.animatedOpacity, {
          toValue: 1,
          duration: 250,
          easing: EasingNode.linear,
        }).start()
      })
    })
  }

  async nextStep(
    nextStep = this.tutorialStepAsArray[
      this.tutorialStepAsArray.indexOf(this.step) + 1
    ]
  ) {
    sharedOnboardingStore.stepObject.messageBoxPosition = undefined
    if (
      this.step !== TutorialStep.Close &&
      this.step !== TutorialStep.BreakdownLessThanTwo &&
      this.step !== TutorialStep.BreakdownCompletedTodo
    ) {
      this.previousStep = this.step
    }
    // Here we are checking does currentStep exists at all. If not, we are definging empty hole
    const getCurrentStep = AllStages[nextStep]
    if (getCurrentStep) {
      // Getting our nodeId
      const currentStep = await getCurrentStep()
      if (currentStep) {
        if (!currentStep.dontSave) {
          this.savedStep = nextStep
        }
        if (currentStep.nodeId) {
          try {
            const holePosition = await measurePosition(currentStep.nodeId)
            if (currentStep.predefined) {
              holePosition.y = currentStep.predefined
            }
            const buildedHole = this.buildRnHole(
              holePosition,
              currentStep.divider,
              currentStep.borderRadius,
              currentStep.heightMultiplier
            )
            this.changeStepAndHole(nextStep, buildedHole, currentStep)
          } catch (err) {
            console.log(err)
            logEvent(`onboardingError-${nextStep}`)
          }
        } else {
          this.changeStepAndHole(nextStep, this.defaultHole, currentStep)
        }
      } else {
        this.changeStepAndHole(nextStep, this.defaultHole)
      }
    } else {
      this.changeStepAndHole(nextStep, this.defaultHole)
      this.stepObject = {}
    }
  }

  get closeButtonText() {
    return translate(`onboarding.closeButtonText`)
  }

  @computed get nextStepButtonText() {
    return this.stepObject.customContinueText
      ? translate(`onboarding.${this.step}.nextStepButton`)
      : translate('onboarding.defaultNextStepButtonText')
  }

  @computed get prefixText() {
    return `onboarding.${this.step}`
  }

  @computed get currentBoxBody() {
    return translate(`onboarding.${this.step}.messageBoxBody`) || ''
  }
}

export const sharedOnboardingStore = new OnboardingStore()
hydrate('OnboardingStore', sharedOnboardingStore).then(() => {
  sharedOnboardingStore.hydrated = true
  hydrateStore('OnboardingStore')
})

// We are dynamicaly importing our nodeIds
export const AllStages = {
  [TutorialStep.Start]: async () => {
    sharedOnboardingStore.changeSavedSreen(OnboardingSreens.Current)
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      additionalButtons: [
        new OnboardingButton(
          () => sharedOnboardingStore.nextStep(TutorialStep.Close),
          'closeButtonText'
        ),
      ],
      customContinueText: true,
    }
  },
  [TutorialStep.Close]: async () => {
    const changedMindButton = new OnboardingButton(
      () => sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep),
      'changedMyMind',
      true
    )
    const articleButton = new OnboardingButton(
      () => {
        sharedOnboardingStore.tutorialIsShown = true
        sharedOnboardingStore.nextStep(TutorialStep.Start)
        navigate('Rules')
      },
      'article',
      true
    )
    const closeEverythingButton = new OnboardingButton(() => {
      sharedOnboardingStore.tutorialIsShown = true
      sharedOnboardingStore.nextStep(TutorialStep.Start)
      Toast.show({
        text: `${translate('onboarding.Close.toast')}`,
      })
    }, 'closeEverything')

    return {
      additionalButtons: [
        changedMindButton,
        articleButton,
        closeEverythingButton,
      ],
      notShowContinue: true,
      notShowClose: true,
      messageBoxPosition: 'center',
      dontSave: true,
    }
  },
  [TutorialStep.Explain]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.AddTask]: async () => {
    const nodeId = (await import('@components/PlusButton')).PlusButtonLayout
    return { nodeId, notShowContinue: true }
  },
  [TutorialStep.AddText]: () => {
    return new Promise(async (resolve) => {
      sharedOnboardingStore.changeSavedSreen(OnboardingSreens.AddTodo)
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/add/AddTodoForm')).textRowNodeId
        resolve({
          nodeId,
          divider: 16,
          borderRadius: 16,
        })
      })
    })
  },
  [TutorialStep.SelectDate]: async () => {
    const nodeId = (await import('@views/add/AddTodoForm')).dateRowNodeId
    return { nodeId, divider: 16, dontSave: true, borderRadius: 16 }
  },
  [TutorialStep.SelectFrog]: async () => {
    const nodeId = (await import('@views/add/AddTodoForm')).frogRowNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
      customContinueText: true,
    }
  },
  [TutorialStep.SelectCompleted]: async () => {
    const nodeId = (await import('@views/add/AddTodoForm')).completedRowNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.ShowMore]: async () => {
    const nodeId = (await import('@views/add/AddTodoForm')).showMoreRowNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.AddAnotherTask]: async () => {
    const nodeId = (await import('@components/AddButton')).addButonNodeId
    return {
      nodeId,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.AddTodoComplete]: async () => {
    const gotItButton = new OnboardingButton(
      () => addTodoEventEmitter.emit(AddTodoEventEmitterEvent.saveTodo),
      undefined,
      true,
      true
    )
    const nodeId = (await import('@views/add/AddTodo')).saveButtonNodeId
    return {
      nodeId,
      notShowContinue: true,
      divider: 16,
      dontSave: true,
      borderRadius: 10,
      heightMultiplier: 6,
      additionalButtons: [gotItButton],
    }
  },
  [TutorialStep.ExplainCurrent]: async () => {
    sharedOnboardingStore.changeSavedSreen(OnboardingSreens.Current)
    const nodeId = (await import('@views/current/CurrentContent'))
      .currentTodoNodeId
    return { nodeId, divider: 11.5 }
  },
  [TutorialStep.DeleteEditComplete]: async () => {
    const nodeId = (await import('@components/TodoCard/TodoCardActions'))
      .todoActionsNodeId
    return {
      nodeId,
      divider: 4,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.Breakdown]: async () => {
    const gotItButton = new OnboardingButton(
      async () => {
        navigate('BreakdownTodo', {
          breakdownTodo:
            (await sharedTodoStore.todayUncompletedTodos?.fetch())![0],
        })
      },
      undefined,
      true,
      true
    )
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {})
      const nodeId = (await import('@components/TodoCard/TodoCardActions'))
        .breakdownNodeId
      resolve({
        nodeId,
        notShowContinue: true,
        divider: 8,
        heightMultiplier: 6,
        borderRadius: Platform.OS === 'ios' ? 16 : undefined,
        additionalButtons: [gotItButton],
      })
    })
  },
  [TutorialStep.BreakdownTodo]: async () => {
    const nodeId = (await import('@views/add/AddTodo')).breakdownTodoNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.BreakdownTodoAction]: async () => {
    const nodeId = (await import('@views/add/AddTodo')).saveButtonNodeId
    const gotItButton = new OnboardingButton(
      () => addTodoEventEmitter.emit(AddTodoEventEmitterEvent.saveTodo),
      undefined,
      true,
      true
    )
    return {
      nodeId,
      dontSave: true,
      additionalButtons: [gotItButton],
      notShowContinue: true,
      divider: 16,
      borderRadius: 10,
      heightMultiplier: 6,
    }
  },
  [TutorialStep.BreakdownLessThanTwo]: async () => {
    const gotItButton = new OnboardingButton(
      () => sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep),
      undefined,
      true,
      true
    )
    return {
      additionalButtons: [gotItButton],
      notShowContinue: true,
      notShowClose: true,
      messageBoxPosition: 'center',
      dontSave: true,
      customContinueText: true,
    }
  },
  [TutorialStep.BreakdownVanish]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.PlanningExplain]: async () => {
    sharedOnboardingStore.changeSavedSreen(OnboardingSreens.Planning)
    const nodeId = (await import('@assets/images/planning-active'))
      .BottomTabPlanningButton
    const measuredPlanningButton = await measurePosition(nodeId)
    return {
      messageBoxPosition: 'center',
      nodeId,
      divider: 0.5,
      predefined: measuredPlanningButton.y + measuredPlanningButton.height / 3,
    }
  },
  [TutorialStep.PlanningExplain2]: async () => {
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainHashtags]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainSearchAndCompleted]: async () => {
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/planning/PlanningHeaderSegment'))
          .planningHeaderNodeId
        resolve({
          nodeId,
          messageBoxPosition: 'center',
          borderRadius: Platform.OS === 'ios' ? 16 : undefined,
        })
      })
    })
  },
  [TutorialStep.ExplainReccuring]: async () => {
    sharedOnboardingStore.changeSavedSreen(OnboardingSreens.Settings)
    const articleButton = new OnboardingButton(
      () => {
        Linking.openURL(
          'https://blog.borodutch.com/automation-kills-productivity'
        )
      },
      'article',
      true
    )
    return {
      additionalButtons: [articleButton],
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainSettings]: async () => {
    const nodeId = (await import('@assets/images/settings-active'))
      .BottomTabSettingsgButton
    const measuredSettingsButton = await measurePosition(nodeId)
    return {
      messageBoxPosition: 'center',
      nodeId,
      divider: 0.5,
      predefined: measuredSettingsButton.y + measuredSettingsButton.height / 3,
    }
  },
  [TutorialStep.ExplainNotifications]: async () => {
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainNotificationsGoogle]: () => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        // Actual ScrollView
        const scrollView = (await import('@views/settings/Settings'))
          .scrollViewRef
        // Actual integration button node
        const integrationButtonNodeId = (
          await import('@views/settings/GeneralSettings')
        ).integrationButtonsNodeId
        // Content rendered inside of ScrollView (unfortunately scrollview does not give a full height of content inside of it)
        const scrollContentRef = (await import('@views/settings/Settings'))
          .settingsContentRef
        // node of scrollContent
        const scrollContentNodeId = findNodeHandle(scrollContentRef)
        if (!scrollContentNodeId) return
        // height/width/x/y of settingsContent
        const measuredSettingsContent = await measurePosition(
          scrollContentNodeId
        )
        // position of integrationButton not relative to the rootRef, but to the scrollContent
        const buttonWithOffset = await measurePosition(
          integrationButtonNodeId,
          scrollContentRef
        )
        // scrolling to our intergationButton
        scrollView.scrollTo({
          y: buttonWithOffset.y,
        })
        // Wait for the scroll
        setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            const offset = settingsScrollOffset
            const buttonWithOffsetPosition = await measurePosition(
              integrationButtonNodeId
            )
            resolve({
              nodeId: integrationButtonNodeId,
              predefined: buttonWithOffsetPosition.y - offset.y,
              borderRadius: Platform.OS === 'ios' ? 16 : undefined,
            })
          })
        }, 500)
      })
    })
  },
  [TutorialStep.ExplainMultiplatform]: async () => {
    const todorantWebsiteButton = new OnboardingButton(
      () => Linking.openURL('https://todorant.com'),
      'website',
      true
    )
    return {
      additionalButtons: [todorantWebsiteButton],
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainPricing]: async () => {
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.Feedback]: async () => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .scrollViewRef
        scrollView.scrollToEnd()
        // Wait for the scroll
        setTimeout(() => {
          InteractionManager.runAfterInteractions(async () => {
            const feedButton = (await import('@views/settings/Settings'))
              .supportButtonNodeId
            const offset = settingsScrollOffset
            const feedButtonPosition = await measurePosition(feedButton)
            resolve({
              nodeId: feedButton,
              predefined: feedButtonPosition.y - offset.y,
              borderRadius: Platform.OS === 'ios' ? 16 : undefined,
            })
          })
        }, 500)
      })
    })
  },
  [TutorialStep.Rules]: async () => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .scrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@views/settings/Settings')).howToUseNodeId
        resolve({
          nodeId,
          borderRadius: Platform.OS === 'ios' ? 16 : undefined,
        })
      })
    })
  },
  [TutorialStep.Info]: async () => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .scrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@components/InfoButton')).infoButtonNodeId
        resolve({
          nodeId: Platform.OS === 'android' ? nodeId : undefined,
          messageBoxPosition: 'center',
        })
      })
    })
  },
  [TutorialStep.Congratulations]: async () => {
    const endTutorialButton = new OnboardingButton(
      () => {
        sharedOnboardingStore.tutorialIsShown = true
        sharedOnboardingStore.nextStep(TutorialStep.Start)
        sharedOnboardingStore.changeSavedSreen(OnboardingSreens.Current)
        startConfetti(true)
      },
      'nextStepButton',
      true
    )
    return {
      messageBoxPosition: 'center',
      additionalButtons: [endTutorialButton],
      notShowContinue: true,
      notShowClose: true,
      customContinueText: true,
    }
  },
  [TutorialStep.BreakdownCompletedTodo]: async () => {
    const holdOnButton = new OnboardingButton(
      () =>
        sharedOnboardingStore.nextStep(
          sharedOnboardingStore.previousStep === TutorialStep.SelectCompleted
            ? TutorialStep.ShowMore
            : sharedOnboardingStore.previousStep
        ),
      undefined,
      true,
      true
    )
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      notShowContinue: true,
      additionalButtons: [holdOnButton],
      dontSave: true,
    }
  },
  [TutorialStep.SelectDateNotAllowed]: async () => {
    const holdOnButton = new OnboardingButton(
      () => sharedOnboardingStore.nextStep(TutorialStep.SelectFrog),
      undefined,
      true,
      true
    )
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      notShowContinue: true,
      additionalButtons: [holdOnButton],
      dontSave: true,
    }
  },
  [TutorialStep.AddTextContinueButton]: async () => {
    const continueButton = new OnboardingButton(
      () => {
        Keyboard.dismiss()
        if (sharedOnboardingStore.textInTodo?.length) {
          sharedOnboardingStore.nextStep(TutorialStep.SelectDate)
        } else {
          sharedOnboardingStore.nextStep(TutorialStep.AddTextContinueTooFast)
        }
      },
      'continue',
      true
    )
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/add/AddTodoForm')).textRowNodeId
        resolve({
          nodeId,
          divider: 16,
          borderRadius: 16,
          dontSave: true,
          notShowMessage: true,
          notShowContinue: true,
          additionalButtons: [continueButton],
        })
      })
    })
  },
  [TutorialStep.AddTextContinueTooFast]: async () => {
    const gotItButton = new OnboardingButton(
      () => sharedOnboardingStore.nextStep(TutorialStep.AddTextContinueButton),
      undefined,
      true,
      true
    )
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      notShowContinue: true,
      additionalButtons: [gotItButton],
      dontSave: true,
    }
  },
} as { [step in TutorialStep]: (() => Promise<Step | undefined>) | undefined }
