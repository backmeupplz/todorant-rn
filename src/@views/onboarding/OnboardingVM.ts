import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
import { translate } from '@utils/i18n'
import { computed } from 'mobx'
import Animated, { Easing } from 'react-native-reanimated'

const withoutButton = [
  TutorialStep.AddTask,
  TutorialStep.AddTodoComplete,
  TutorialStep.AddText,
  TutorialStep.Breakdown,
  TutorialStep.BreakdownTodoAction,
]

//
export class OnboardingVM {
  get closeButtonText() {
    return translate(`onboarding.closeButtonText`)
  }

  @computed get nextStepButtonText() {
    return translate(`onboarding.${sharedOnboardingStore.step}.nextStepButton`)
  }

  @computed get currentBoxBody() {
    return (
      translate(`onboarding.${sharedOnboardingStore.step}.messageBoxBody`) || ''
    )
  }

  @computed get isButtonRequired() {
    return !withoutButton.includes(sharedOnboardingStore.step)
  }

  changeBoxMessage() {
    Animated.timing(sharedOnboardingStore.animatedOpacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.linear,
    }).start(() => {
      sharedOnboardingStore.nextStep()
      Animated.timing(sharedOnboardingStore.animatedOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.linear,
      }).start()
    })
  }
}
