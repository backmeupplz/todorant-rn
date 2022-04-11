import { Component } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { View } from 'native-base'
import { checkSubscriptionAndNavigate } from '@utils/checkSubscriptionAndNavigate'
import { navigationRef } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import CustomIcon from '@components/CustomIcon'
import LinearGradient from 'react-native-linear-gradient'
import React from 'react'

export let PlusButtonLayout: number

@observer
export class PlusButton extends Component {
  render() {
    return (
      <View
        onLayout={({ nativeEvent: { target } }: any) => {
          if (navigationRef.current?.getCurrentRoute()?.name !== 'Current')
            return
          PlusButtonLayout = target
        }}
        style={{
          width: 48,
          height: 64,
          position: 'absolute',
          bottom: 24,
          right: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            checkSubscriptionAndNavigate('AddTodo')
          }}
          disabled={
            !sharedOnboardingStore.tutorialIsShown &&
            sharedOnboardingStore.step !== TutorialStep.AddTask
          }
        >
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
