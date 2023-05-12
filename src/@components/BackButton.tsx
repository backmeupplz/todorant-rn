import { Icon } from 'native-base'
import { Keyboard } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { goBack } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import React from 'react'

const backButtonStore = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  back: () => {},
}

const BackButton = observer(({ useBackStore }) => {
  const handlePress = () => {
    if (!sharedOnboardingStore.tutorialIsShown) {
      Keyboard.dismiss()
      sharedOnboardingStore.nextStep(TutorialStep.BreakdownLessThanTwo)
    } else {
      if (useBackStore) {
        backButtonStore.back()
      } else {
        goBack()
      }
    }
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <Icon
        type="MaterialIcons"
        name="arrow-back"
        style={{
          color: sharedColors.textColor,
          opacity: 0.5,
          marginHorizontal: 12,
        }}
      />
    </TouchableOpacity>
  )
})

export default BackButton
