import React, { Component } from 'react'
import Animated, { Easing } from 'react-native-reanimated'
import { MessageBox } from '@views/onboarding/MessageBox'
import {
  ERNHoleViewTimingFunction,
  RNHole,
  RNHoleView,
} from '@upacyxou/react-native-hole-view'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { measurePosition } from '@stores/OnboardingStore/measurePosition'
import { makeObservable, observable, reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Dimensions, Keyboard, Platform } from 'react-native'

export let tutorialOverlayRef: Overlay

@observer
export class Overlay extends Component {
  state = {
    holes: [{ x: 0, y: 0, width: 0, height: 0, borderRadius: 0 }],
  } as { holes: RNHole[] }

  opacityAnimationValue = new Animated.Value(0)
  messageBoxOpacity = new Animated.Value(1)

  infoBoxY = new Animated.Value(0)
  infoBoxX = new Animated.Value(0)

  @observable shouldRender = false

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
              const avatarPadding = 16
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
                const totalSize =
                  messageBoxPosition.y + messageBoxPosition.height
                const totalPosition =
                  Math.abs(sharedOnboardingStore.currentHole.y - totalSize) +
                  Math.abs(totalSize)
                if (
                  totalPosition < Dimensions.get('window').height &&
                  sharedOnboardingStore.currentHole.y +
                    sharedOnboardingStore.currentHole.height +
                    messageBoxPosition.y >
                    Dimensions.get('window').height
                ) {
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y -
                      (totalSize + avatarPadding),
                    duration: 500,
                    easing: Easing.ease,
                  }).start()
                } else {
                  messageBoxPosition.height += avatarPadding
                  messageBoxPosition.y -= avatarPadding
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y -
                      messageBoxPosition.y +
                      sharedOnboardingStore.currentHole.height,
                    duration: 500,
                    easing: Easing.ease,
                  }).start()
                }
              }
            })
          }
        )
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

  renderHoles() {
    return (
      <RNHoleView
        pointerEvents={Platform.OS === 'android' ? 'box-none' : undefined}
        animation={{
          duration: 500,
          timingFunction: ERNHoleViewTimingFunction.LINEAR,
        }}
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
    )
  }

  render() {
    return (
      <>
        {sharedOnboardingStore.hydrated &&
          this.shouldRender &&
          Platform.OS === 'ios' &&
          this.renderHoles()}
        <Animated.View
          pointerEvents="box-none"
          style={{
            maxWidth: this.shouldRender
              ? sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction
                ? 0
                : undefined
              : 0,
            maxHeight: this.shouldRender
              ? sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction
                ? 0
                : undefined
              : 0,
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
          {this.shouldRender && Platform.OS === 'android' && (
            <Animated.View
              pointerEvents={this.shouldRender ? 'box-only' : 'box-none'}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                maxWidth: this.shouldRender ? undefined : 0,
                maxHeight: this.shouldRender ? undefined : 0,
                opacity: this.opacityAnimationValue,
              }}
            >
              {this.renderHoles()}
            </Animated.View>
          )}
          {sharedOnboardingStore.messageBoxAppear && (
            <Animated.View
              pointerEvents={this.shouldRender ? undefined : 'box-none'}
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
              <MessageBox />
            </Animated.View>
          )}
        </Animated.View>
      </>
    )
  }
}
