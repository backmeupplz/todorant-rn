import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { Component } from 'react'
import { PlanningContent } from '@views/planning/PlanningContent'
import { PlanningHeader } from '@views/planning/PlanningHeader'
import { PlanningHeaderLeft } from '@views/planning/PlanningHeaderLeft'
import { PlanningHeaderRight } from '@views/planning/PlanningHeaderRight'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

const Stack = createStackNavigator()

@observer
export class Planning extends Component {
  render() {
    return (
      <Stack.Navigator
        screenOptions={{
          detachPreviousScreen: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      >
        <Stack.Screen
          name="Planning"
          component={PlanningContent}
          options={{
            headerTitle: () => <PlanningHeader />,
            headerRight: () => <PlanningHeaderRight />,
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
            ...headerBackButtonProps(),
            headerLeft: () => <PlanningHeaderLeft />,
          }}
        />
      </Stack.Navigator>
    )
  }
}
