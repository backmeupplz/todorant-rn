import { translate } from '@utils/i18n'
import { rootRef } from '../../App'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import {
  Dimensions,
  findNodeHandle,
  InteractionManager,
  Linking,
  StyleProp,
  UIManager,
  ViewStyle,
} from 'react-native'
import { RNHole } from '@upacyxou/react-native-hole-view'
import Animated, { Easing } from 'react-native-reanimated'
import { hydrate } from './hydration/hydrate'
import { hydrateStore } from './hydration/hydrateStore'
import { navigate } from '@utils/navigation'
import { Toast } from 'native-base'
import { startConfetti } from '@components/Confetti'
import { logEvent } from '@utils/logEvent'
import { sharedSessionStore } from './SessionStore'

export enum TutorialStep {
  BreakdownLessThanTwo = 'BreakdownLessThanTwo',
  Finished = 'Finished',
  Close = 'Close',
  Intro = 'Intro',
  Explain = 'Explain',
  AddTask = 'AddTask',
  AddText = 'AddText',
  SelectDate = 'SelectDate',
  SelectFrog = 'SelectFrog',
  SelectCompleted = 'SelectCompleted',
  ShowMore = 'ShowMore',
  AddAnotherTask = 'AddAnotherTask',
  AddTodoComplete = 'AddTodoComplete',
  ExplainCurrent = 'ExplainCurrent',
  DeleteEditComplete = 'DeleteEditComplete',
  Breakdown = 'Breakdown',
  BreakdownTodo = 'BreakdownTodo',
  BreakdownTodoAction = 'BreakdownTodoAction',
  BreakdownVanish = 'BreakdownVanish',
  PlanningExplain = 'PlanningExplain',
  PlanningExplain2 = 'PlanningExplain2',
  ExplainHashtags = 'ExplainHashtags',
  ExplainSearchAndCompleted = 'ExplainSearchAndCompleted',
  ExplainReccuring = 'ExplainReccuring',
  ExplainSettings = 'ExplainSettings',
  ExplainNotifications = 'ExplainNotifications',
  ExplainMultiplatform = 'ExplainMultiplatform',
  ExplainPricing = 'ExplainPricing',
  Feedback = 'Feedback',
  Rules = 'Rules',
  Info = 'Info',
  Congratulations = 'Congratulations',
}

class StepParams {
  @persist nodeId?: number
  @persist additionalButtons?: MessageBoxButton[]
  @persist messageBoxPosition?: 'above' | 'below' | 'center'
  @persist notShowContinue?: boolean
  @persist notShowClose?: boolean
  @persist predefined?: number
  @persist divider?: number
}

class RNHoleParams {
  @persist height?: number
  @persist width?: number
  @persist x?: number
  @persist y?: number
  @persist borderRadius?: number
}

class OnboardingStore {
  constructor() {
    makeObservable(this)
  }

  hydrated = false

  defaultHole: RNHole = {
    x: Dimensions.get('window').width / 2,
    y: Dimensions.get('window').height / 2,
    width: 0,
    height: 0,
    borderRadius: 128,
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
    borderRadius = 128
  ) {
    const halfOfHeight = height / divider
    const halfOfWidth = width / divider
    height += halfOfHeight
    width += halfOfWidth
    x -= halfOfWidth / 2
    y -= halfOfHeight / 2
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
      this.step !== TutorialStep.BreakdownLessThanTwo
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
              currentStep.borderRadius
            )
            this.changeStepAndHole(nextStep, buildedHole, currentStep)
          } catch (err) {
            console.log(err)
            logEvent(`onboardingError-${nextStep}`)
          }
        } else {
          this.changeStepAndHole(nextStep, this.defaultHole, currentStep)
        }
        // this.stepObject = currentStep
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

interface MessageBoxButton {
  action: () => void
  message: string
  preferred?: boolean
}

interface Step {
  nodeId?: number
  additionalButtons?: MessageBoxButton[]
  messageBoxPosition?: 'above' | 'below' | 'center'
  notShowContinue?: boolean
  notShowClose?: boolean
  predefined?: number
  divider?: number
  dontSave?: boolean
  borderRadius?: number
}

// We are dynamiccaly import our nodeIds
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
    return new Promise(async (resolve, reject) => {
      navigate('AddTodo')
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/add/AddTodoForm')).TextRowNodeId
        resolve({ nodeId, notShowContinue: true, divider: 16 })
      })
    })
  },
  [TutorialStep.SelectDate]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).DateRowNodeId
    return { nodeId, divider: 16, dontSave: true, borderRadius: 32 }
  },
  [TutorialStep.SelectFrog]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).FrogRowNodeId
    return { nodeId, divider: 16, dontSave: true }
  },
  [TutorialStep.SelectCompleted]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).CompletedRowNodeId
    return { nodeId, divider: 16, dontSave: true }
  },
  [TutorialStep.ShowMore]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).ShowMoreRowNodeId
    return { nodeId, notShowContinue: true, divider: 16, dontSave: true }
  },
  [TutorialStep.AddAnotherTask]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@components/AddButton')).AddButonNodeId
    return { nodeId, dontSave: true }
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
    }
  },
  [TutorialStep.ExplainCurrent]: async () => {
    const nodeId = (await import('@components/TodoCard/TodoCardContent'))
      .CurrentTodoNodeId
    return { nodeId, divider: 11.5 }
  },
  [TutorialStep.DeleteEditComplete]: async () => {
    const nodeId = (await import('@components/TodoCard/TodoCardActions'))
      .TodoActionsNodeId
    return { nodeId, divider: 4 }
  },
  [TutorialStep.Breakdown]: async () => {
    const nodeId = (await import('@components/TodoCard/TodoCardActions'))
      .BrakdownNodeId
    return { nodeId, notShowContinue: true }
  },
  [TutorialStep.BreakdownTodo]: async () => {
    const nodeId = (await import('@views/add/AddTodo')).BreakdownTodoNodeId
    return { nodeId, divider: 16, dontSave: true }
  },
  [TutorialStep.BreakdownTodoAction]: async () => {
    const nodeId = findNodeHandle(rootRef)
    return { nodeId, notShowContinue: true, notShowClose: true, dontSave: true }
  },
  [TutorialStep.PlanningExplain]: async () => {
    navigate('Planning')
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.PlanningExplain2]: async () => {
    navigate('Planning')
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainSearchAndCompleted]: async () => {
    return new Promise(async (resolve, reject) => {
      navigate('Planning')
      InteractionManager.runAfterInteractions(async () => {
        const nodeId = (await import('@views/planning/PlanningHeaderSegment'))
          .PlanningHeaderNodeId
        resolve({ nodeId, messageBoxPosition: 'center' })
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
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainNotifications]: async () => {
    navigate('Settings')
    if (!!sharedSessionStore.user) {
      // Highlight integration button
    } else {
      await sharedOnboardingStore.nextStep(TutorialStep.ExplainMultiplatform)
      // sharedOnboardingStore.currentHole = { x: 0, y: 0, width: 0, height: 0 }
      // sharedOnboardingStore.step = sharedOnboardingStore.getNextStep
    }
    return {
      messageBoxPosition: 'center',
    }
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
    return new Promise(async (resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        const feedButton = (await import('@views/settings/Settings'))
          .SupportButtonNodeId
        const feedButtonPosition = await measurePosition(feedButton)
        const SettingsBeforeFeedbackButton = (
          await import('@views/settings/Settings')
        ).SettingsBeforeFeedbackButton
        const measuredSettingsBeforeFeedback = await measurePosition(
          SettingsBeforeFeedbackButton
        )
        scrollView.scrollToEnd()
        resolve({
          nodeId: feedButton,
          messageBoxPosition: 'center',
          predefined:
            Dimensions.get('window').height -
            (feedButtonPosition.y - measuredSettingsBeforeFeedback.height) -
            feedButtonPosition.height * 2,
        })
      })
    })
  },
  [TutorialStep.Rules]: async () => {
    navigate('Settings')
    return new Promise(async (resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@views/settings/Settings')).HowToUseNodeId
        resolve({
          nodeId,
        })
      })
    })
  },
  [TutorialStep.Info]: async () => {
    navigate('Settings')
    return new Promise(async (resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        const scrollView = (await import('@views/settings/Settings'))
          .ScrollViewRef
        scrollView.scrollTo({ y: 0 })
        const nodeId = (await import('@components/InfoButton')).InfoButtonNodeId
        resolve({
          nodeId,
          messageBoxPosition: 'center',
        })
      })
    })
  },
  [TutorialStep.Intro]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
} as { [step in TutorialStep]: (() => Promise<Step | undefined>) | undefined }

export function measurePosition(nodeId: number, rootNode = rootRef) {
  return new Promise<RNHole>((resolve, reject) => {
    UIManager.measureLayout(
      nodeId,
      findNodeHandle(rootNode) as number,
      () => {
        // If error
        reject("Can't measure position of a given node.")
      },
      // Получаем абсолютные значения нашего ref-элемента
      (x, y, width, height) => {
        resolve({ x, y, width, height })
      }
    )
  })
}
