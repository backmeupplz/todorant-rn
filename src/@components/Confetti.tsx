import { View } from 'native-base'
import Confetti from 'react-native-confetti'
import React, { memo } from 'react'

let confettiRef: any

let animating = false
export function startConfetti(showForSure = false) {
  const random = Math.floor(Math.random() * 5)
  if ((animating || random) !== 0 && !showForSure) {
    return
  }
  animating = true
  confettiRef.startConfetti()
  setTimeout(() => {
    animating = false
  }, 2000)
}

export const ConfettiView = memo(() => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
      }}
      pointerEvents="none"
    >
      <Confetti
        duration={2000}
        confettiCount={25}
        timeout={20}
        ref={(node: any) => (confettiRef = node)}
      />
    </View>
  )
})
