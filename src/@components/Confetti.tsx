import React, { Component } from 'react'
import { View } from 'native-base'
import Confetti from 'react-native-confetti'

let confettiRef: any

let animating = false
export function startConfetti() {
  const random = Math.floor(Math.random() * 5)
  console.log(random)
  if (animating || random !== 0) {
    return
  }
  animating = true
  confettiRef.startConfetti()
  setTimeout(() => {
    animating = false
  }, 2000)
}

export class ConfettiView extends Component {
  render() {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Confetti
          duration={2000}
          confettiCount={25}
          timeout={20}
          ref={(node: any) => (confettiRef = node)}
        />
      </View>
    )
  }
}
