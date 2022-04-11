import { BackButton } from '@components/BackButton'
import { Observer } from 'mobx-react'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { View } from 'native-base'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import React from 'react'

export function headerBackButtonProps(useBackStore = false) {
  return {
    headerLeft: () => (
      <Observer>
        {() => (
          <View
            style={{ flexDirection: 'row' }}
            pointerEvents={
              sharedOnboardingStore.tutorialIsShown ||
              sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction
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
