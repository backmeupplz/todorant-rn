import { translate } from '@utils/i18n'
import { rootRef } from '../../App'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
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

export enum TutorialStep {
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
  Congratulations = 'Congratulations',
}

const stepsWithNextButtons = [TutorialStep.Intro, TutorialStep.Explain]

class OnboardingStore {
  constructor() {
    makeObservable(this)
  }

  hydrated = false

  messageBoxId: number | undefined
  animatedOpacity = new Animated.Value(1)
  tutorialStepAsArray = Array.from(Object.values(TutorialStep))
  currentHole: undefined | RNHole = undefined

  @observable messageBoxAppear = true
  @observable step = TutorialStep.Intro
  @observable tutorialWasShown = false

  @computed get nextButtonRequired() {
    return stepsWithNextButtons.includes(this.step)
  }

  buildRnHole({ x, y, width, height, borderRadius = 128 }: RNHole) {
    const halfOfHeight = height / 2
    const halfOfWidth = width / 2
    height += halfOfHeight
    width += halfOfWidth
    x -= halfOfWidth / 2
    y -= halfOfHeight / 2
    return { height, width, x, y, borderRadius }
  }

  measurePosition(nodeId: number) {
    return new Promise<RNHole>((resolve, reject) => {
      UIManager.measureLayout(
        nodeId,
        findNodeHandle(rootRef) as number,
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

  async nextStep() {
    const nextStep = this.tutorialStepAsArray[
      this.tutorialStepAsArray.indexOf(this.step) + 1
    ]
    // Here we are checking does currentStep exists at all. If not, we are definging empty hole
    const currentStep = AllStages[nextStep]
    if (!!currentStep) {
      // Getting our nodeId
      let currentStepNodeId = currentStep()
      if (currentStepNodeId) {
        try {
          const holePosition = await this.measurePosition(currentStepNodeId)
          const buildedHole = this.buildRnHole(holePosition)
          this.currentHole = buildedHole
          this.step = nextStep
        } catch (err) {
          // Do nothing
        }
      } else {
        this.currentHole = {
          x: Dimensions.get('window').width,
          y: Dimensions.get('window').height,
          width: 0,
          height: 0,
        }
        this.step = nextStep
      }
    } else {
      this.currentHole = {
        x: Dimensions.get('window').width,
        y: Dimensions.get('window').height,
        width: 0,
        height: 0,
      }
      this.step = nextStep
    }
  }
}

export const sharedOnboardingStore = new OnboardingStore()
hydrate('OnboardingStore', sharedOnboardingStore).then(() => {
  sharedOnboardingStore.hydrated = true
  hydrateStore('SessionStore')
})

// We are dynamiccaly import our nodeIds
export const AllStages = {
  [TutorialStep.AddTask]: () => {
    const { PlusButtonLayout } = require('@components/PlusButton')
    return PlusButtonLayout
  },
  [TutorialStep.AddText]: () => {
    const { TextRowNodeId } = require('@views/add/AddTodoForm')
    return TextRowNodeId
  },
  [TutorialStep.SelectDate]: () => {
    const { DateRowNodeId } = require('@views/add/AddTodoForm')
    return DateRowNodeId
  },
  [TutorialStep.SelectFrog]: () => {
    const { FrogRowNodeId } = require('@views/add/AddTodoForm')
    return FrogRowNodeId
  },
  [TutorialStep.SelectCompleted]: () => {
    const { CompletedRowNodeId } = require('@views/add/AddTodoForm')
    return CompletedRowNodeId
  },
  [TutorialStep.ShowMore]: () => {
    const { ShowMoreRowNodeId } = require('@views/add/AddTodoForm')
    return ShowMoreRowNodeId
  },
  [TutorialStep.AddAnotherTask]: () => {
    const { AddButonNodeId } = require('@components/AddButton')
    return AddButonNodeId
  },
  [TutorialStep.AddTodoComplete]: () => {
    const { SaveButtonNodeId } = require('@views/add/AddTodo')
    return SaveButtonNodeId
  },
  [TutorialStep.ExplainCurrent]: () => {
    const {
      CurrentTodoNodeId,
    } = require('@components/TodoCard/TodoCardContent')
    return CurrentTodoNodeId
  },
  [TutorialStep.DeleteEditComplete]: () => {
    const {
      TodoActionsNodeId,
    } = require('@components/TodoCard/TodoCardActions')
    return TodoActionsNodeId
  },
  [TutorialStep.Breakdown]: () => {
    const { BrakdownNodeId } = require('@components/TodoCard/TodoCardActions')
    return BrakdownNodeId
  },
  [TutorialStep.BreakdownTodo]: () => {
    const { BreakdownTodoNodeId } = require('@views/add/AddTodo')
    return BreakdownTodoNodeId
  },
  [TutorialStep.BreakdownTodoAction]: () => {
    const RootNodeId = findNodeHandle(rootRef)
    return RootNodeId
  },
  [TutorialStep.PlanningExplain]: () => {
    navigate('Planning')
  },
  [TutorialStep.ExplainSearchAndCompleted]: () => {
    const {
      PlanningHeaderNodeId,
    } = require('@views/planning/PlanningHeaderSegment')
    return PlanningHeaderNodeId
  },
  [TutorialStep.ExplainReccuring]: () => {
    navigate('Settings')
  },
  [TutorialStep.ExplainSettings]: () => {
    const RootNodeId = findNodeHandle(rootRef)
    return RootNodeId
  },
  [TutorialStep.ExplainNotifications]: () => {
    if (sharedSessionStore.user) {
      // Highlight integration button
    } else {
      // sharedOnboardingStore.currentHole = { x: 0, y: 0, width: 0, height: 0 }
      // sharedOnboardingStore.step = sharedOnboardingStore.getNextStep
    }
  },
} as { [step in TutorialStep]: (() => number | undefined) | undefined }
