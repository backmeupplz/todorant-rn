import React from 'react'
import { BackButton } from '@components/BackButton'
import { View } from 'native-base'
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
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
