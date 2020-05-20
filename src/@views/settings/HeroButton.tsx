import React, { Component } from 'react'
import { Text, View } from 'native-base'
import { Animated, Easing } from 'react-native'
import { Button } from '@components/Button'
import { navigate } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { ProgressBar } from '@components/ProgressBar'
const shortNum = require('number-shortener')

export class HeroButtonContent extends Component<{}> {
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
          transparent
          onPress={() => {
            navigate('HeroProfile')
          }}
          onPressIn={() => {
            this.animate(true)
          }}
          onPressOut={() => {
            this.animate(false)
          }}
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text {...sharedColors.textExtraStyle}>{shortNum(1500)}</Text>
          <View
            style={{
              width: '100%',
              marginTop: 4,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              height: 4,
              paddingLeft: 12,
            }}
          >
            <ProgressBar progress={0.5} />
          </View>
        </Button>
      </Animated.View>
    )
  }
}

export const HeroButton = () => () => <HeroButtonContent />
