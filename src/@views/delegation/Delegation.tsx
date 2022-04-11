import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { Component } from 'react'
import { DelegateContent } from '@views/delegation/DelegateContent'
import { DelegationHeader } from '@views/delegation/DelegationHeader'
import { InfoButton } from '@components/InfoButton'
import { Observer, observer } from 'mobx-react'
import { View } from 'native-base'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

const Stack = createStackNavigator()

@observer
class DelegationHeaderRight extends Component {
  render() {
    return <View>{InfoButton('delegate.info')()}</View>
  }
}

export function Delegation() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator
          screenOptions={{
            detachPreviousScreen: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        >
          <Stack.Screen
            name="Delegation"
            component={DelegateContent}
            options={{
              headerTitle: () => <DelegationHeader />,
              headerRight: () => <DelegationHeaderRight />,
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
              headerLeft: undefined,
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
