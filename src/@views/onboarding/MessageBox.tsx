import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { Dimensions, View } from 'react-native'
import { OnboardingButton } from '@views/onboarding/OnboardingButton'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import Animated, { Easing } from 'react-native-reanimated'
import { translate } from '@utils/i18n'
import { makeObservable, observable, reaction } from 'mobx'
import { isDeviceSmall, isLandscapeAndNotAPad } from '@utils/deviceInfo'
// RN 64.* import {  EasingNode } from 'react-native-reanimated'

const avatar = require('@assets/images/nikita.jpg')

@observer
export class MessageBox extends Component {
  avatarOpacity = new Animated.Value(1)

  @observable margin = isLandscapeAndNotAPad() || isDeviceSmall() ? 6 : 12
  @observable padding = isLandscapeAndNotAPad() || isDeviceSmall() ? 9 : 18

  @observable showAvatar =
    sharedOnboardingStore.step === TutorialStep.Start ||
    sharedOnboardingStore.step === TutorialStep.Explain

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener(
      'change',
      async ({ window: { width, height } }) => {
        const shouldPaddingBeSmall =
          isLandscapeAndNotAPad(width, height) || isDeviceSmall()
        this.margin = shouldPaddingBeSmall ? 6 : 12
        this.padding = shouldPaddingBeSmall ? 9 : 18
      }
    )
    reaction(
      () => sharedOnboardingStore.tutorialIsShown,
      () => {
        this.showAvatar = true
        Animated.timing(this.avatarOpacity, {
          toValue: 1,
          duration: 500,
          // RN 64.* easing: EasingNode.linear,
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
            // RN 64.* easing: EasingNode.linear,
            easing: Easing.linear,
          }).start()
        } else {
          Animated.timing(this.avatarOpacity, {
            toValue: 0,
            duration: 500,
            // RN 64.* easing: EasingNode.linear,
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
              margin: this.margin,
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
        {!sharedOnboardingStore.stepObject.notShowMessage && (
          <View
            style={{
              backgroundColor: sharedColors.backgroundColor,
              padding: this.padding,
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
        )}
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
