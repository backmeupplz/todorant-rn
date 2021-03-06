import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { Linking, View } from 'react-native'
import { OnboardingButton } from '@views/onboarding/OnboardingButton'
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
import Animated from 'react-native-reanimated'
import { OnboardingVM } from './OnboardingVM'
import { translate } from '@utils/i18n'

@observer
export class MessageBox extends Component {
  onboardingVM = new OnboardingVM()

  render() {
    return (
      <View
        style={{ alignItems: 'center', width: '100%' }}
        onLayout={({ nativeEvent: { target } }: any) => {
          sharedOnboardingStore.messageBoxId = target
        }}
      >
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
              {sharedOnboardingStore.currentBoxBody}
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
          {!sharedOnboardingStore.stepObject.notShowContinue && (
            <OnboardingButton
              preferred
              title={sharedOnboardingStore.nextStepButtonText}
              onPress={() => {
                this.onboardingVM.changeBoxMessage()
              }}
            />
          )}
          {!!sharedOnboardingStore.stepObject.additionalButtons &&
            sharedOnboardingStore.stepObject.additionalButtons.map(
              (button, index) => {
                return (
                  <OnboardingButton
                    key={index}
                    preferred={button.preferred}
                    title={translate(
                      `${sharedOnboardingStore.prefixText}.${button.message}`
                    )}
                    onPress={() => {
                      button.action()
                    }}
                  />
                )
              }
            )}
          {!sharedOnboardingStore.stepObject.notShowClose && (
            <OnboardingButton
              title={sharedOnboardingStore.closeButtonText}
              onPress={() => {
                sharedOnboardingStore.nextStep(TutorialStep.Close)
                // sharedOnboardingStore.tutorialWasShown = true
              }}
            />
          )}
        </View>
      </View>
    )
  }
}
