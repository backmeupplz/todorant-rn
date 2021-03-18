import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { View } from 'react-native'
import { OnboardingButton } from '@views/onboarding/OnboardingButton'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import Animated, { Easing } from 'react-native-reanimated'
import { translate } from '@utils/i18n'
import { observable, reaction } from 'mobx'

const avatar = require('@assets/images/nikita.jpg')

@observer
export class MessageBox extends Component {
  avatarOpacity = new Animated.Value(1)

  @observable showAvatar =
    sharedOnboardingStore.step === TutorialStep.Start ||
    sharedOnboardingStore.step === TutorialStep.Explain

  componentDidMount() {
    reaction(
      () => sharedOnboardingStore.tutorialWasShown,
      () => {
        this.showAvatar = true
        Animated.timing(this.avatarOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
        }).start()
      }
    )
    reaction(
      () => sharedOnboardingStore.step,
      async (newValue) => {
        if (
          newValue === TutorialStep.Start ||
          newValue === TutorialStep.Explain
        ) {
          this.showAvatar = true
          Animated.timing(this.avatarOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
          }).start()
        } else {
          Animated.timing(this.avatarOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
          }).start(() => {
            this.showAvatar = false
          })
        }
      }
    )
  }

  render() {
    return (
      <View
        style={{ alignItems: 'center', width: '100%' }}
        onLayout={({ nativeEvent: { target } }: any) => {
          sharedOnboardingStore.messageBoxId = target
        }}
      >
        {this.showAvatar && (
          <Animated.View
            style={{
              margin: 12,
              width: 104,
              height: 104,
              borderRadius: 52,
              borderColor: sharedColors.backgroundColor,
              borderWidth: 2,
              opacity: this.avatarOpacity,
            }}
          >
            <Animated.Image
              source={avatar}
              resizeMode="cover"
              style={{
                width: 100,
                height: 100,
                resizeMode: 'cover',
                borderRadius: 50,
              }}
            />
          </Animated.View>
        )}
        <View
          style={{
            backgroundColor: sharedColors.backgroundColor,
            padding: 18,
            borderRadius: 28,
            width: '100%',
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
                sharedOnboardingStore.nextStep()
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
                    title={
                      button.notAllowed
                        ? translate('onboarding.notAllowed')
                        : translate(
                            `${sharedOnboardingStore.prefixText}.${button.message}`
                          )
                    }
                    onPress={() => {
                      button.action()
                    }}
                  />
                )
              }
            )}
        </View>
      </View>
    )
  }
}
