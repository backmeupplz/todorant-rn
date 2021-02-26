import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated from 'react-native-reanimated'

@observer
export class OnboardingButton extends Component<{
  title: string
  preferred?: boolean
  onPress: () => void
}> {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={{
          marginHorizontal: 8,
          marginVertical: 9,
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
            padding: 18,
            opacity: this.props.preferred ? 1 : 0.7,
          }}
        >
          <Animated.View
            style={{ opacity: sharedOnboardingStore.animatedOpacity }}
          >
            <Text
              style={{
                color: this.props.preferred ? 'white' : sharedColors.textColor,
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
