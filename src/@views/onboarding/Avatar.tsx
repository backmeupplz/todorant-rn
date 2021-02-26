import { sharedColors } from '@utils/sharedColors'
import { makeObservable, observable, reaction } from 'mobx'
import { observer } from 'mobx-react'
import { View } from 'native-base'
import React, { Component } from 'react'
import Animated, {
  Easing,
  TransitioningView,
  Value,
} from 'react-native-reanimated'
import { Image } from 'react-native'
import { Dimensions } from 'react-native'

import { Transition, Transitioning } from 'react-native-reanimated'
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'

const avatar = require('@assets/images/nikita.jpg')

@observer
export class Avatar extends Component {
  animatedValue = new Animated.Value(1)

  widthPosition = new Animated.Value(0)

  ref = React.createRef<TransitioningView>()

  transition = (
    <Transition.Together>
      <Transition.In
        type="slide-right"
        durationMs={2000}
        interpolation={'easeInOut'}
      />
      <Transition.In type="fade" durationMs={2000} />
    </Transition.Together>
  )

  componentDidMount() {
    reaction(
      () => sharedOnboardingStore.step,
      (newValue) => {
        switch (newValue) {
          case TutorialStep.AddTask:
            const imageSize = 52
            const padding = 24
            Animated.timing(this.animatedValue, {
              toValue: 0.5,
              duration: 500,
              easing: Easing.ease,
            }).start()
            Animated.timing(this.widthPosition, {
              toValue: -Dimensions.get('window').width + imageSize + padding,
              duration: 500,
              easing: Easing.ease,
            }).start()
        }
      }
    )
  }

  render() {
    return (
      <Animated.View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          borderColor: sharedColors.backgroundColor,
          borderWidth: 2,
          marginBottom: 9,
          transform: [
            {
              scaleX: this.animatedValue,
            },
            {
              scaleY: this.animatedValue,
            },
            { translateX: this.widthPosition },
          ],
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
    )
  }
}
