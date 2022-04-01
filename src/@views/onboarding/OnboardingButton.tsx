import { Component } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native'
import { Text } from 'native-base'
import { isDeviceSmall, isLandscapeAndNotAPad } from '@utils/deviceInfo'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import Animated from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'

@observer
export class OnboardingButton extends Component<{
  title: string
  preferred?: boolean
  onPress: () => void
}> {
  @observable padding = isLandscapeAndNotAPad() || isDeviceSmall() ? 9 : 18
  @observable marginTop = isLandscapeAndNotAPad() || isDeviceSmall() ? 6 : 12

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener(
      'change',
      async ({ window: { width, height } }) => {
        const shouldPaddingBeSmall =
          isLandscapeAndNotAPad(width, height) || isDeviceSmall()
        this.padding = shouldPaddingBeSmall ? 9 : 18
        this.marginTop = shouldPaddingBeSmall ? 6 : 12
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
