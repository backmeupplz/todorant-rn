import React, { Component } from 'react'
import { Animated } from 'react-native'
import { MessageBox } from '@views/onboarding/MessageBox'
import { RNHoleView } from 'react-native-hole-view'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { Avatar } from '@views/onboarding/Avatar'

export let tutorialOverlayRef: Overlay

export class Overlay extends Component {
  opacityAnimationValue = new Animated.Value(0)

  componentDidMount() {
    tutorialOverlayRef = this

    if (!sharedOnboardingStore.tutorialWasShown) {
      this.trigger(true)
    }
  }

  trigger(show = true) {
    Animated.timing(this.opacityAnimationValue, {
      toValue: show ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          opacity: this.opacityAnimationValue,
        }}
      >
        <RNHoleView
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          holes={[
            { x: 315, y: 700, width: 120, height: 120, borderRadius: 60 },
          ]}
        />
        <Avatar />
        <MessageBox />
      </Animated.View>
    )
  }
}
