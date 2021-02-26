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

const stageMap = new Map<string, any>()

class OnboardingStore {
  hydrated = false

  @observable step = TutorialStep.Intro

  @observable tutorialWasShown = false

  animatedOpacity = new Animated.Value(1)

  tutorialStepAsArray = Array.from(Object.values(TutorialStep))

  currentHole: undefined | RNHole = undefined

  holes: RNHole[] = []

  stages = new Map<string, RNHole[]>()

  @observable messageBoxAppear = true

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

  nextStep() {
    const nextStep = this.tutorialStepAsArray[
      this.tutorialStepAsArray.indexOf(this.step) + 1
    ]
    /* Тут мы проверяем, существует ли вообще currentStep. Если нет, то 
      мы просто объявялем пустой hole. */
    const currentStep = AllStages[nextStep]
    if (!!currentStep) {
      // Динамично получаем наш ref
      let currentStepNodeId = currentStep()
      if (currentStepNodeId) {
        // Считаем абсолютную позицию относительно нашего Root-экрана (самого главного)
        UIManager.measureLayout(
          currentStepNodeId,
          findNodeHandle(rootRef) as number,
          () => {
            // If error
            // Do nothing
          },
          // Получаем абсолютные значения нашего ref-элемента
          (x, y, width, height) => {
            const buildedHole = this.buildRnHole({ x, y, width, height })
            this.currentHole = buildedHole
            this.step = nextStep
          }
        )
      }
    } else {
      this.currentHole = { x: 0, y: 0, width: 0, height: 0 }
      this.step = nextStep
    }
  }

  constructor() {
    makeObservable(this)
  }
}

export const sharedOnboardingStore = new OnboardingStore()
hydrate('OnboardingStore', sharedOnboardingStore).then(() => {
  sharedOnboardingStore.hydrated = true
  hydrateStore('SessionStore')
})

// Мы динамично импортируем нужные нам REF'ы, ибо если импортировать их сразу, они не успевают инициализироваться и они возвращают undefined
export const AllStages = {
  [TutorialStep.AddTask]: () => {
    const { PlusButtonLayout } = require('@components/PlusButton')
    return PlusButtonLayout
  },
  [TutorialStep.AddText]: () => {
    const { TextRowNodeId } = require('@views/add/AddTodoForm')
    return TextRowNodeId
  },
} as { [step in TutorialStep]: () => number | undefined }
