import React from 'react'
import { BackButton } from '@components/BackButton'
import { View } from 'native-base'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { Observer } from 'mobx-react'

export function headerBackButtonProps(useBackStore = false) {
  return {
    headerLeft: () => (
      <Observer>
        {() => (
          <View
            style={{ flexDirection: 'row' }}
            pointerEvents={
              sharedOnboardingStore.tutorialWasShown
                ? 'auto'
                : sharedOnboardingStore.step ===
                  TutorialStep.BreakdownTodoAction
                ? 'auto'
                : 'none'
            }
          >
            <BackButton useBackStore={useBackStore} />
          </View>
        )}
      </Observer>
    ),
  }
}
