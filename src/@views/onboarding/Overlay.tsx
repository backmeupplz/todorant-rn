import React, { Component } from 'react'
import Animated, { Easing } from 'react-native-reanimated'
import { MessageBox } from '@views/onboarding/MessageBox'
import {
  ERNHoleViewTimingFunction,
  IRNHoleViewAnimation,
  RNHole,
  RNHoleView,
} from 'react-native-hole-view'
import {
  measurePosition,
  sharedOnboardingStore,
  TutorialStep,
} from '@stores/OnboardingStore'
import { Avatar } from '@views/onboarding/Avatar'
import { makeObservable, observable, reaction } from 'mobx'
import { observer } from 'mobx-react'
import {
  Button,
  Dimensions,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export let tutorialOverlayRef: Overlay

@observer
export class Overlay extends Component {
  state = {
    animation: undefined,
    holes: [{ x: 0, y: 0, width: 0, height: 0, borderRadius: 60 }],
  }

  opacityAnimationValue = new Animated.Value(0)
  messageBoxOpacity = new Animated.Value(1)

  infoBoxY = new Animated.Value(0)
  infoBoxX = new Animated.Value(0)

  @observable shouldRender = true

  messageBoxNodeId: number | undefined

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(this.messageBoxOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
      }).start()
    })
    Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(this.messageBoxOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
      }).start()
    })
    setTimeout(() => {
      this.setState({
        animation: {
          timingFunction: ERNHoleViewTimingFunction.EASE_IN_OUT,
          duration: 500,
        },
      })
    })
    reaction(
      () => sharedOnboardingStore.tutorialWasShown,
      () => {
        this.trigger(!sharedOnboardingStore.tutorialWasShown)
      }
    )

    reaction(
      () => sharedOnboardingStore.step,
      (step) => {
        this.setState(
          {
            holes: [sharedOnboardingStore.currentHole],
          },
          () => {
            setTimeout(async () => {
              const messageBoxNodeId = sharedOnboardingStore.messageBoxId
              if (!messageBoxNodeId) return

              if (
                sharedOnboardingStore.stepObject.messageBoxPosition === 'center'
              ) {
                Animated.timing(this.infoBoxY, {
                  toValue: 0,
                  duration: 500,
                  easing: Easing.ease,
                }).start()
              } else if (
                sharedOnboardingStore.currentHole &&
                sharedOnboardingStore.currentHole.y
              ) {
                const messageBoxPosition = await measurePosition(
                  messageBoxNodeId
                )
                const totalPosition =
                  messageBoxPosition.y + messageBoxPosition.height
                const idk =
                  Math.abs(
                    sharedOnboardingStore.currentHole.y - totalPosition
                  ) + Math.abs(totalPosition)
                if (idk < Dimensions.get('window').height) {
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y - totalPosition,
                    duration: 500,
                    easing: Easing.ease,
                  }).start()
                  //
                } else {
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y -
                      messageBoxPosition.y +
                      sharedOnboardingStore.currentHole.height,
                    duration: 500,
                    easing: Easing.ease,
                  }).start()
                }
                sharedOnboardingStore.currentHole
              }
            })
          }
        )
        this.setState({
          animation: {
            timingFunction: ERNHoleViewTimingFunction.EASE_IN_OUT,
            duration: 500,
          },
        })
      }
    )

    tutorialOverlayRef = this

    this.trigger(!sharedOnboardingStore.tutorialWasShown)
  }

  trigger(show = true) {
    Animated.timing(this.opacityAnimationValue, {
      toValue: show ? 1 : 0,
      duration: 500,
      easing: Easing.linear,
    }).start(() => {
      this.shouldRender = !sharedOnboardingStore.tutorialWasShown
    })
  }

  render() {
    return this.shouldRender ? (
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
        {sharedOnboardingStore.messageBoxAppear && (
          <Animated.View
            pointerEvents="box-none"
            style={{
              opacity: this.messageBoxOpacity,
              width: '100%',
              maxWidth: 400,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: this.infoBoxY }],
            }}
          >
            {/* <Avatar /> */}
            <MessageBox />
          </Animated.View>
        )}
        <Animated.View
          pointerEvents="box-only"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: this.opacityAnimationValue,
          }}
        >
          <RNHoleView
            animation={this.state.animation}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
            holes={this.state.holes}
          />
        </Animated.View>
      </Animated.View>
    ) : null
  }
}
