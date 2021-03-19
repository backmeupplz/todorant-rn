import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { isLandscapeAndNotAPad, isPad } from '@utils/deviceInfo'
import { sharedColors } from '@utils/sharedColors'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { Dimensions, NativeModules, TouchableOpacity } from 'react-native'
import { isLandscape } from 'react-native-device-info'
import LinearGradient from 'react-native-linear-gradient'
import Animated from 'react-native-reanimated'

@observer
export class OnboardingButton extends Component<{
  title: string
  preferred?: boolean
  onPress: () => void
}> {
  @observable padding = isLandscapeAndNotAPad() ? 9 : 18
  @observable marginTop = isLandscapeAndNotAPad() ? 6 : 12

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener(
      'change',
      async ({ window: { width, height } }) => {
        const isLandscape = isLandscapeAndNotAPad(width, height)
        this.padding = isLandscape ? 9 : 18
        this.marginTop = isLandscape ? 6 : 12
      }
    )
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={{
          marginTop: this.marginTop,
        }}
      >
        <LinearGradient
          colors={
            this.props.preferred ? ['#1148B9', '#3581fc'] : ['white', 'white']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            backgroundColor: this.props.preferred
              ? 'linear-gradient(126.87deg, #1148B9 0%, #5C9BFF 100%)'
              : sharedColors.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 28,
            padding: this.padding,
            opacity: this.props.preferred ? 1 : 0.7,
          }}
        >
          <Animated.View
            style={{ opacity: sharedOnboardingStore.animatedOpacity }}
          >
            <Text
              style={{
                color: this.props.preferred
                  ? 'white'
                  : sharedSettingsStore.isDark
                  ? 'black'
                  : sharedColors.textColor,
              }}
            >
              {this.props.title}
            </Text>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }
}
