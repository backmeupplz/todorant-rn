import { Component } from 'react'
import {
  Dimensions,
  InteractionManager,
  Keyboard,
  Platform,
} from 'react-native'
import {
  ERNHoleViewTimingFunction,
  RNHole,
  RNHoleView,
} from '@upacyxou/react-native-hole-view'
import { EasingNode } from 'react-native-reanimated'
import { MessageBox } from '@views/onboarding/MessageBox'
import { RootStackParamList, navigate } from '@utils/navigation'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { isDeviceSmall, isLandscapeAndNotAPad } from '@utils/deviceInfo'
import { makeObservable, observable, reaction } from 'mobx'
import { measurePosition } from '@stores/OnboardingStore/measurePosition'
import { observer } from 'mobx-react'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import Animated from 'react-native-reanimated'

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
  @observable maxWidth = isLandscapeAndNotAPad() ? undefined : 400

  messageBoxNodeId: number | undefined

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener(
      'change',
      async ({ window: { width, height } }) => {
        const isLandscape = isLandscapeAndNotAPad(width, height)
        this.maxWidth = isLandscape ? undefined : 400
      }
    )
    Keyboard.addListener('keyboardDidShow', () => {
      if (sharedOnboardingStore.step !== TutorialStep.AddText) return
      sharedOnboardingStore.nextStep(TutorialStep.AddTextContinueButton)
    })
    reaction(
      () => sharedOnboardingStore.tutorialIsShown,
      () => {
        this.trigger(!sharedOnboardingStore.tutorialIsShown)
      }
    )
    if (sharedOnboardingStore.hydrated) {
      if (sharedOnboardingStore.savedStep) {
        sharedOnboardingStore.tutorialIsShown = true
        return
      }
      this.trigger(!sharedOnboardingStore.tutorialIsShown)
    }
    reaction(
      () => sharedOnboardingStore.hydrated,
      () => {
        this.trigger(!sharedOnboardingStore.tutorialIsShown)
      }
    )
    reaction(
      () => sharedOnboardingStore.step,
      () => {
        this.setState(
          {
            holes: [sharedOnboardingStore.currentHole],
          },
          () => {
            setTimeout(async () => {
              const avatarPadding =
                isLandscapeAndNotAPad() || isDeviceSmall() ? 4 : 16
              const messageBoxNodeId = sharedOnboardingStore.messageBoxId
              if (!messageBoxNodeId) return
              if (
                sharedOnboardingStore.stepObject.messageBoxPosition === 'center'
              ) {
                Animated.timing(this.infoBoxY, {
                  toValue: 0,
                  duration: 500,
                  easing: EasingNode.linear,
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
                if (
                  sharedOnboardingStore.currentHole.y +
                    totalSize -
                    Dimensions.get('screen').height >
                  avatarPadding * 2
                ) {
                  // Move bubble above the hole
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y -
                      (totalSize + avatarPadding),
                    duration: 500,
                    easing: EasingNode.linear,
                  }).start()
                } else {
                  // Move bubble under the hole
                  messageBoxPosition.height += avatarPadding
                  messageBoxPosition.y -= avatarPadding
                  Animated.timing(this.infoBoxY, {
                    toValue:
                      sharedOnboardingStore.currentHole.y -
                      messageBoxPosition.y +
                      sharedOnboardingStore.currentHole.height,
                    duration: 500,
                    easing: EasingNode.linear,
                  }).start()
                }
              }
            })
          }
        )
      }
    )
  }

  trigger(show = true) {
    Animated.timing(this.opacityAnimationValue, {
      toValue: show ? 1 : 0,
      duration: 500,
      easing: EasingNode.linear,
    }).start(() => {
      this.shouldRender = !sharedOnboardingStore.tutorialIsShown
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
          {this.shouldRender && sharedOnboardingStore.messageBoxAppear && (
            <Animated.View
              pointerEvents={this.shouldRender ? undefined : 'box-none'}
              style={{
                opacity: this.messageBoxOpacity,
                width: '100%',
                maxWidth: this.maxWidth,
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

export function checkOnboardingStep() {
  InteractionManager.runAfterInteractions(async () => {
    setTimeout(() => {
      if (
        sharedOnboardingStore.tutorialIsShown ||
        !sharedOnboardingStore.savedStep
      )
        return
      navigate(
        sharedOnboardingStore.screen as string as keyof RootStackParamList
      )
      sharedOnboardingStore.nextStep(sharedOnboardingStore.savedStep)
    }, 500)
  })
}
