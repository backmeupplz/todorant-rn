import React, { Component } from 'react'
import { Text } from 'native-base'
import Animated, { Easing } from 'react-native-reanimated'
import { translate } from '@utils/i18n'

export let dayCompleteOverlayRef: any

export function startDayCompleteAnimation() {}

export class DayCompleteOverlay extends Component {
  componentDidMount() {
    dayCompleteOverlayRef = this
  }

  animating = false

  transparrency = new Animated.Value(0)

  startAnimation() {
    if (this.animating) {
      return
    }
    this.animating = true
    Animated.timing(this.transparrency, {
      toValue: 1,
      duration: 9000,
      easing: Easing.linear,
    }).start(() => {
      Animated.timing(this.transparrency, {
        toValue: 0,
        duration: 1000,
        easing: Easing.linear,
      }).start(() => {
        this.animating = false
      })
    })
  }

  render() {
    const opacity = this.transparrency.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity,
        }}
        pointerEvents="none"
      >
        <Text
          style={{
            color: 'rgba(153, 126, 40, 1)',
            fontSize: 40,
            textAlign: 'center',
          }}
        >
          {translate('missionPassed')}
        </Text>
        <Text style={{ color: 'white', fontSize: 40, textAlign: 'center' }}>
          {translate('respect')}
        </Text>
      </Animated.View>
    )
  }
}
