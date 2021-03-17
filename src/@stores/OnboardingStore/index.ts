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
} from 'react-native'
import { RNHole } from '@upacyxou/react-native-hole-view'
import Animated, { Easing } from 'react-native-reanimated'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { navigate } from '@utils/navigation'
import { Toast } from 'native-base'
import { startConfetti } from '@components/Confetti'
import { logEvent } from '@utils/logEvent'
import { measurePosition } from '@stores/OnboardingStore/measurePosition'

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
      {
        message: 'closeButtonText',
        action: () => {
          sharedOnboardingStore.nextStep(TutorialStep.Close)
        },
      },
    ],
  }

  @persist @observable savedStep?: TutorialStep
  @observable messageBoxAppear = true
  @observable step = TutorialStep.Intro
  @observable previousStep = TutorialStep.Intro
  @persist @observable tutorialWasShown = false

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

  changeStepAndHole(
    step: TutorialStep,
    hole: RNHole = this.defaultHole,
    stepObject?: Step
  ) {
    logEvent(step)
    this.currentHole = hole
    Animated.timing(this.animatedOpacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.linear,
    }).start(() => {
      this.step = step
      if (stepObject) {
        this.stepObject = stepObject
      }
      Animated.timing(this.animatedOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.linear,
      }).start()
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
    return translate(`onboarding.${this.step}.nextStepButton`)
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
  [TutorialStep.Info]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.Close]: async () => {
    const changedMindButton = {
      message: 'changedMyMind',
      action: () => {
        sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep)
      },
      preferred: true,
    }
    const articleButton = {
      message: 'article',
      action: () => {
        sharedOnboardingStore.tutorialWasShown = true
        sharedOnboardingStore.nextStep(TutorialStep.Intro)
        navigate('Rules')
      },
      preferred: true,
    }
    const closeEverythingButton = {
      message: 'closeEverything',
      action: () => {
        sharedOnboardingStore.tutorialWasShown = true
        sharedOnboardingStore.nextStep(TutorialStep.Intro)
        Toast.show({
          text: `${translate('onboarding.Close.toast')}`,
        })
      },
    }
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
  [TutorialStep.AddTask]: async () => {
    const nodeId = (await import('@components/PlusButton')).PlusButtonLayout
    return { nodeId, notShowContinue: true }
  },
  [TutorialStep.AddText]: () => {
    return new Promise(async (resolve) => {
      navigate('AddTodo')
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/add/AddTodoForm')).TextRowNodeId
        resolve({
          nodeId,
          notShowContinue: true,
          divider: 16,
          borderRadius: 16,
        })
      })
    })
  },
  [TutorialStep.SelectDate]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).DateRowNodeId
    return { nodeId, divider: 16, dontSave: true, borderRadius: 16 }
  },
  [TutorialStep.SelectFrog]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).FrogRowNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.SelectCompleted]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).CompletedRowNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.ShowMore]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).ShowMoreRowNodeId
    return {
      nodeId,
      notShowContinue: true,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.AddAnotherTask]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@components/AddButton')).AddButonNodeId
    return {
      nodeId,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.AddTodoComplete]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodo')).SaveButtonNodeId
    return {
      nodeId,
      notShowContinue: true,
      divider: 16,
      dontSave: true,
      borderRadius: 10,
      heightMultiplier: 6,
    }
  },
  [TutorialStep.ExplainCurrent]: async () => {
    navigate('Current')
    const nodeId = (await import('@views/current/CurrentContent'))
      .CurrentTodoNodeId
    return { nodeId, divider: 11.5 }
  },
  [TutorialStep.DeleteEditComplete]: async () => {
    const nodeId = (await import('@components/TodoCard/TodoCardActions'))
      .TodoActionsNodeId
    return {
      nodeId,
      divider: 4,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.Breakdown]: async () => {
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {})
      const nodeId = (await import('@components/TodoCard/TodoCardActions'))
        .BrakdownNodeId
      resolve({
        nodeId,
        notShowContinue: true,
        divider: 8,
        heightMultiplier: 6,
        borderRadius: Platform.OS === 'ios' ? 16 : undefined,
      })
    })
  },
  [TutorialStep.BreakdownTodo]: async () => {
    const nodeId = (await import('@views/add/AddTodo')).BreakdownTodoNodeId
    return {
      nodeId,
      divider: 16,
      dontSave: true,
      borderRadius: Platform.OS === 'ios' ? 16 : undefined,
    }
  },
  [TutorialStep.BreakdownTodoAction]: async () => {
    const nodeId = findNodeHandle(rootRef)
    return { nodeId, notShowContinue: true, notShowClose: true, dontSave: true }
  },
  [TutorialStep.PlanningExplain]: async () => {
    navigate('Planning')
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
    navigate('Planning')
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainSearchAndCompleted]: async () => {
    return new Promise(async (resolve) => {
      navigate('Planning')
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/planning/PlanningHeaderSegment'))
          .PlanningHeaderNodeId
        resolve({
          nodeId,
          messageBoxPosition: 'center',
          borderRadius: Platform.OS === 'ios' ? 16 : undefined,
        })
      })
    })
  },
  [TutorialStep.ExplainReccuring]: async () => {
    navigate('Settings')
    const articleButton = {
      preferred: true,
      message: 'article',
      action: () => {
        Linking.openURL(
          'https://blog.borodutch.com/automation-kills-productivity'
        )
      },
    }
    return {
      additionalButtons: [articleButton],
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainPricing]: async () => {
    navigate('Settings')
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainSettings]: async () => {
    navigate('Settings')
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
    navigate('Settings')
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        // Actual ScrollView
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        // Actual integration button node
        const integrationButtonNodeId = (
          await import('@views/settings/GeneralSettings')
        ).IntegrationButtonsNodeId
        // Content rendered inside of ScrollView (unfortunately scrollview does not give a full height of content inside of it)
        const scrollContentRef = (await import('@views/settings/Settings'))
          .SettingsContentRef
        // node of scrollContent
        const scrollContentNodeId = findNodeHandle(scrollContentRef)
        if (!scrollContentNodeId) return
        // height/width/x/y of settingsContent
        const measuredSettingsContent = await measurePosition(
          scrollContentNodeId
        )
        // position of integrationButton not relative to the rootRef, but to the scrollContent
        let buttonWithOffset = await measurePosition(
          integrationButtonNodeId,
          scrollContentRef
        )
        // scrolling to our intergationButton
        scrollView.scrollTo({
          y: buttonWithOffset.y,
        })
        InteractionManager.runAfterInteractions(async () => {
          buttonWithOffset = await measurePosition(
            integrationButtonNodeId,
            scrollContentRef
          )
          resolve({
            nodeId: integrationButtonNodeId,
            predefined: Math.abs(
              measuredSettingsContent.height -
                buttonWithOffset.y -
                Dimensions.get('window').height +
                buttonWithOffset.height * 2.5
            ),
          })
        })
      })
    })
  },
  [TutorialStep.Congratulations]: async () => {
    const endTutorialButton = {
      message: 'nextStepButton',
      action: () => {
        sharedOnboardingStore.tutorialWasShown = true
        navigate('Current')
        startConfetti()
      },
      preferred: true,
    }
    return {
      messageBoxPosition: 'center',
      additionalButtons: [endTutorialButton],
      notShowContinue: true,
      notShowClose: true,
    }
  },
  [TutorialStep.BreakdownLessThanTwo]: async () => {
    const gotItButton = {
      message: 'nextStepButton',
      action: () => {
        sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep)
      },
      preferred: true,
    }
    return {
      additionalButtons: [gotItButton],
      notShowContinue: true,
      notShowClose: true,
      messageBoxPosition: 'center',
      dontSave: true,
    }
  },
  [TutorialStep.BreakdownVanish]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.Explain]: async () => {
    navigate('Current')
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainHashtags]: async () => {
    navigate('Planning')
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainMultiplatform]: async () => {
    navigate('Settings')
    const todorantWebsiteButton = {
      preferred: true,
      message: 'website',
      action: () => {
        Linking.openURL('https://todorant.com')
      },
    }
    return {
      additionalButtons: [todorantWebsiteButton],
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.Feedback]: async () => {
    navigate('Settings')
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        scrollView.scrollToEnd()
        InteractionManager.runAfterInteractions(async () => {
          const feedButton = (await import('@views/settings/Settings'))
            .SupportButtonNodeId
          const feedButtonPosition = await measurePosition(feedButton)
          const SettingsBeforeFeedbackButton = (
            await import('@views/settings/Settings')
          ).SettingsBeforeFeedbackButton
          const measuredSettingsBeforeFeedback = await measurePosition(
            SettingsBeforeFeedbackButton
          )
          resolve({
            nodeId: feedButton,
            messageBoxPosition: 'center',
            predefined:
              Dimensions.get('window').height -
              (feedButtonPosition.y - measuredSettingsBeforeFeedback.height) -
              feedButtonPosition.height * 2,
            borderRadius: Platform.OS === 'ios' ? 16 : undefined,
          })
        })
      })
    })
  },
  [TutorialStep.Rules]: async () => {
    navigate('Settings')
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@views/settings/Settings')).HowToUseNodeId
        resolve({
          nodeId,
          borderRadius: Platform.OS === 'ios' ? 16 : undefined,
        })
      })
    })
  },
  [TutorialStep.Info]: async () => {
    navigate('Settings')
    return new Promise(async (resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@components/InfoButton')).InfoButtonNodeId
        resolve({
          nodeId: Platform.OS === 'android' ? nodeId : undefined,
          messageBoxPosition: 'center',
        })
      })
    })
  },
  [TutorialStep.Intro]: async () => {
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      additionalButtons: [
        {
          message: 'closeButtonText',
          action: () => {
            sharedOnboardingStore.nextStep(TutorialStep.Close)
          },
        },
      ],
    }
  },
  [TutorialStep.BreakdownCompletedTodo]: async () => {
    const holdOnButton = {
      preferred: true,
      message: 'holdOnButtonText',
      action: () => {
        sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep)
      },
    }
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      notShowContinue: true,
      additionalButtons: [holdOnButton],
      dontSave: true,
    }
  },
  [TutorialStep.SelectDateNotAllowed]: async () => {
    const holdOnButton = {
      preferred: true,
      message: 'holdOnButtonText',
      action: () => {
        sharedOnboardingStore.nextStep(sharedOnboardingStore.previousStep)
      },
    }
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      notShowContinue: true,
      additionalButtons: [holdOnButton],
      dontSave: true,
    }
  },
} as { [step in TutorialStep]: (() => Promise<Step | undefined>) | undefined }
