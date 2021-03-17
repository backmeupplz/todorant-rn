import React, { Component } from 'react'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { goBack } from '@utils/navigation'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { Keyboard } from 'react-native'

export const backButtonStore = {
  back: () => {},
}

@observer
export class BackButton extends Component<{
  useBackStore: boolean
}> {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (!sharedOnboardingStore.tutorialWasShown) {
            Keyboard.dismiss()
            sharedOnboardingStore.nextStep(TutorialStep.BreakdownLessThanTwo)
          } else {
            if (this.props.useBackStore) {
              backButtonStore.back()
            } else {
              goBack()
            }
          }
        }}
      >
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
  }
}
