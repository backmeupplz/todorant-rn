import React, { Component } from 'react'
import { Button, Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { alertMessage, alertSupport } from '@utils/alert'
import { translate } from '@utils/i18n'
import { Animated, Easing, Alert } from 'react-native'

export class InfoButtonContent extends Component<{ message: string }> {
  animationValue = new Animated.Value(0)

  animate(back: boolean) {
    this.animationValue.setValue(back ? 0 : 1)
    Animated.timing(this.animationValue, {
      toValue: back ? 1 : 0,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start()
  }

  render() {
    const spin = this.animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
    })

    return (
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
        }}
      >
        <Button
          icon
          transparent
          onPress={() => {
            setTimeout(() => {
              Alert.alert(
                translate('infoTitle'),
                translate(this.props.message),
                [
                  {
                    text: translate('support'),
                    onPress: () => {
                      alertSupport()
                    },
                  },
                  { text: translate('ok'), onPress: () => {} },
                ]
              )
            }, 100)
          }}
          onPressIn={() => {
            this.animate(true)
          }}
          onPressOut={() => {
            this.animate(false)
          }}
        >
          <Icon
            type="MaterialIcons"
            name="info-outline"
            style={{
              fontSize: 28,
              ...sharedColors.textExtraStyle.style,
            }}
          />
        </Button>
      </Animated.View>
    )
  }
}

export const InfoButton = (message: string) => () => (
  <InfoButtonContent message={message} />
)
