import React, { Component } from 'react'
import { observer, Observer } from 'mobx-react'
import { View } from 'native-base'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { InfoButton } from '@components/InfoButton'
import { sharedColors } from '@utils/sharedColors'
import { DelegateContent } from './DelegateContent'
import { DelegationHeader } from './DelegationHeader'

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
