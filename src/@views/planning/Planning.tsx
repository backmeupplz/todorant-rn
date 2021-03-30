import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { PlanningContent } from '@views/planning/PlanningContent'
import { PlanningHeader } from '@views/planning/PlanningHeader'
import { PlanningHeaderRight } from '@views/planning/PlanningHeaderRight'
import { sharedColors } from '@utils/sharedColors'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { PlanningHeaderLeft } from '@views/planning/PlanningHeaderLeft'

const Stack = createStackNavigator()

@observer
export class Planning extends Component {
  render() {
    return (
      <Stack.Navigator
        screenOptions={{
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
