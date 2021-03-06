import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
import { translate } from '@utils/i18n'
import { computed } from 'mobx'
import Animated, { Easing } from 'react-native-reanimated'

//
export class OnboardingVM {
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
