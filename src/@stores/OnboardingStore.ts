import { translate } from '@utils/i18n'
import { rootRef } from '../../App'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  Linking,
  UIManager,
  View,
} from 'react-native'
import {
  ERNHoleViewTimingFunction,
  IRNHoleViewAnimation,
  RNHole,
} from 'react-native-hole-view'
import Animated, { Easing } from 'react-native-reanimated'
import { hydrate } from './hydration/hydrate'
import { hydrateStore } from './hydration/hydrateStore'
import { navigate } from '@utils/navigation'
import { sharedAppStateStore } from './AppStateStore'
import { sharedSessionStore } from './SessionStore'
import { Toast } from 'native-base'
import { Link } from '@react-navigation/native'
import { startConfetti } from '@components/Confetti'
import { logEvent } from '@utils/logEvent'

export enum TutorialStep {
  BreakdownLessThanTwo = 'BreakdownLessThanTwo',
  Close = 'Close',
  Finished = 'Finished',
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

  @observable messageBoxAppear = true
  @observable step = TutorialStep.Intro
  @observable previousStep = TutorialStep.Intro
  @observable tutorialWasShown = false

  buildRnHole(
    { x, y, width, height, borderRadius = 128 }: RNHole,
    divider = 2
  ) {
    const halfOfHeight = height / divider
    const halfOfWidth = width / divider
    height += halfOfHeight
    width += halfOfWidth
    x -= halfOfWidth / 2
    y -= halfOfHeight / 2
    return { height, width, x, y, borderRadius }
  }

  changeStepAndHole(step: TutorialStep, hole: RNHole = this.defaultHole) {
    logEvent(step)
    this.currentHole = hole
    Animated.timing(this.animatedOpacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.linear,
    }).start(() => {
      this.step = step
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
    this.previousStep = this.step
    // Here we are checking does currentStep exists at all. If not, we are definging empty hole
    const getCurrentStep = AllStages[nextStep]
    if (getCurrentStep) {
      // Getting our nodeId
      const currentStep = await getCurrentStep()
      if (currentStep) {
        this.stepObject = currentStep
        if (currentStep.nodeId) {
          try {
            const holePosition = await measurePosition(currentStep.nodeId)
            if (currentStep.predefined) {
              holePosition.y = currentStep.predefined
            }
            const buildedHole = this.buildRnHole(
              holePosition,
              currentStep.divider
            )
            this.changeStepAndHole(nextStep, buildedHole)
            return
          } catch (err) {
            // Do nothing
          }
        }
      }
    } else {
      this.stepObject = {}
    }
    this.changeStepAndHole(nextStep)
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
  hydrateStore('SessionStore')
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
        navigate('Rules')
      },
      preferred: true,
    }
    const closeEverythingButton = {
      message: 'closeEverything',
      action: () => {
        sharedOnboardingStore.tutorialWasShown = true
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
    }
  },
  [TutorialStep.AddTask]: async () => {
    const nodeId = (await import('@components/PlusButton')).PlusButtonLayout
    return { nodeId, notShowContinue: true }
  },
  [TutorialStep.AddText]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).TextRowNodeId
    return { nodeId, notShowContinue: true, divider: 16 }
  },
  [TutorialStep.SelectDate]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).DateRowNodeId
    return { nodeId, divider: 16 }
  },
  [TutorialStep.SelectFrog]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).FrogRowNodeId
    return { nodeId, divider: 16 }
  },
  [TutorialStep.SelectCompleted]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).CompletedRowNodeId
    return { nodeId, divider: 16 }
  },
  [TutorialStep.ShowMore]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodoForm')).ShowMoreRowNodeId
    return { nodeId, notShowContinue: true, divider: 16 }
  },
  [TutorialStep.AddAnotherTask]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@components/AddButton')).AddButonNodeId
    return { nodeId }
  },
  [TutorialStep.AddTodoComplete]: async () => {
    navigate('AddTodo')
    const nodeId = (await import('@views/add/AddTodo')).SaveButtonNodeId
    return { nodeId, notShowContinue: true, divider: 12 }
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
    return { nodeId, divider: 16 }
  },
  [TutorialStep.BreakdownTodoAction]: async () => {
    const nodeId = findNodeHandle(rootRef)
    return { nodeId, notShowContinue: true, notShowClose: true }
  },
  [TutorialStep.PlanningExplain]: async () => {
    navigate('Planning')
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.PlanningExplain2]: async () => {
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainSearchAndCompleted]: async () => {
    navigate('Planning')
    const nodeId = (await import('@views/planning/PlanningHeaderSegment'))
      .PlanningHeaderNodeId
    return { nodeId, messageBoxPosition: 'center' }
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
    return { messageBoxPosition: 'center' }
  },
  [TutorialStep.ExplainSettings]: async () => {
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
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainHashtags]: async () => {
    return {
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.ExplainMultiplatform]: async () => {
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
    const scrollView = (await import('@views/settings/Settings')).ScrollViewRef
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
    return {
      nodeId: feedButton,
      messageBoxPosition: 'center',
      predefined:
        Dimensions.get('window').height -
        (feedButtonPosition.y - measuredSettingsBeforeFeedback.height) -
        feedButtonPosition.height * 2,
    }
  },
  [TutorialStep.Rules]: async () => {
    const scrollView = (await import('@views/settings/Settings')).ScrollViewRef
    scrollView.scrollTo({ y: 0 })
    const nodeId = (await import('@views/settings/Settings')).HowToUseNodeId
    return {
      nodeId,
    }
  },
  [TutorialStep.Info]: async () => {
    const scrollView = (await import('@views/settings/Settings')).ScrollViewRef
    scrollView.scrollTo({ y: 0 })
    const nodeId = (await import('@components/InfoButton')).InfoButtonNodeId
    return {
      nodeId,
      messageBoxPosition: 'center',
    }
  },
  [TutorialStep.Intro]: async () => {
    const closeButton = {
      message: 'closeButtonText',
      action: () => {
        sharedOnboardingStore.nextStep(TutorialStep.Close)
      },
    }
    return {
      messageBoxPosition: 'center',
      notShowClose: true,
      additionalButtons: [closeButton],
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
