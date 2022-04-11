import { Component } from 'react'
import { Icon } from 'native-base'
import { Keyboard } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { goBack } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import React from 'react'

export const backButtonStore = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
          if (!sharedOnboardingStore.tutorialIsShown) {
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
