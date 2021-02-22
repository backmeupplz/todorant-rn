import { observable } from 'mobx'

enum TutorialStep {
  Finished = 'Finished',
  Intro = 'Intro',
}

class OnboardingStore {
  @observable step = TutorialStep.Intro

  tutorialWasShown = false
}

export const sharedOnboardingStore = new OnboardingStore()
