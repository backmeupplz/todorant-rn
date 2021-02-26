import React, { Component } from 'react'
import { View } from 'native-base'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { plusButtonAction } from '@utils/plusButtonAction'
import LinearGradient from 'react-native-linear-gradient'
import CustomIcon from '@components/CustomIcon'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { findNodeHandle, LayoutRectangle, UIManager } from 'react-native'

export let PlusButtonLayout = {}

export class PlusButton extends Component {
  render() {
    return (
      <View
        onLayout={({ nativeEvent }) => {
          PlusButtonLayout = nativeEvent.target
        }}
        style={{
          width: 48,
          height: 64,
          position: 'absolute',
          bottom: 24,
          right: 16,
        }}
      >
        <TouchableOpacity onPress={plusButtonAction}>
          <LinearGradient
            colors={['#1148B9', '#5C9BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              backgroundColor:
                'linear-gradient(126.87deg, #1148B9 0%, #5C9BFF 100%)',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              borderRadius: 28,
            }}
          >
            <CustomIcon name="add_outline_28" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }
}
