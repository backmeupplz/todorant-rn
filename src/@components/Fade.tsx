import { EasingNode } from 'react-native-reanimated'
import { ViewStyle } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import React, { useEffect, useState } from 'react'

const { Value, timing } = Animated

type FadeProps = {
  visible?: boolean
  style?: ViewStyle
  children?: any
  direction?: 'up' | 'down'
  duration?: number
}

function Fade(props: FadeProps) {
  const opacityValue = new Value(0)
  const translationValue = new Value(0)

  const { style, children, direction, visible, duration } = props
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    opacityValue.setValue(visible ? 1 : (0 as any))
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    const animationConfig = {
      duration: duration || 200,
      easing: EasingNode.linear,
      useNativeDriver: true,
    }
    const opacityConfig = {
      ...animationConfig,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }
    const directionConfig = direction === 'up' ? [0, 5] : [5, 0]
    const translationConfig = {
      ...animationConfig,
      toValue: visible ? directionConfig[0] : directionConfig[1],
      useNativeDriver: true,
    }

    timing(opacityValue, opacityConfig).start()
    if (direction) timing(translationValue, translationConfig).start()
  }, [visible])

  return (
    <Animated.View
      style={
        {
          opacity: opacityValue,
          transform: [{ translateY: translationValue }],
          ...style,
        } as any
      }
    >
      {children}
    </Animated.View>
  )
}

export default Fade
