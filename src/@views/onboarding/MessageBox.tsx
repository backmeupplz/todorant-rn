import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { View } from 'react-native'
import { OnboardingButton } from '@views/onboarding/OnboardingButton'
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
import Animated from 'react-native-reanimated'
import { OnboardingVM } from './OnboardingVM'

@observer
export class MessageBox extends Component {
  onboardingVM = new OnboardingVM()

  render() {
    return (
      <View style={{ alignItems: 'center', width: '100%' }}>
        <View
          style={{
            backgroundColor: sharedColors.backgroundColor,
            padding: 18,
            borderRadius: 28,
            width: '100%',
            marginVertical: 9,
          }}
        >
          <Animated.View
            style={{ opacity: sharedOnboardingStore.animatedOpacity }}
          >
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
              }}
            >
              {this.onboardingVM.currentBoxBody}
            </Text>
          </Animated.View>
        </View>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {sharedOnboardingStore.nextButtonRequired && (
            <OnboardingButton
              preferred
              title={this.onboardingVM.nextStepButtonText}
              onPress={() => {
                this.onboardingVM.changeBoxMessage()
              }}
            />
          )}
          <OnboardingButton
            title={this.onboardingVM.closeButtonText}
            onPress={() => {
              sharedOnboardingStore.tutorialWasShown = true
            }}
          />
        </View>
      </View>
    )
  }
}
