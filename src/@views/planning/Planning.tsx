import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { createStackNavigator } from '@react-navigation/stack'
import { PlanningContent } from '@views/planning/PlanningContent'
import { PlanningHeader } from '@views/planning/PlanningHeader'
import { PlanningHeaderRight } from '@views/planning/PlanningHeaderRight'
import { PlanningHeaderLeft } from '@views/planning/PlanningHeaderLeft'
import { sharedColors } from '@utils/sharedColors'
import { AddTodo } from '@views/add/AddTodo'
import { View } from 'native-base'
import { AddButton } from '@components/AddButton'
import { InfoButton } from '@views/settings/InfoButton'
import { translate } from '@utils/i18n'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/LoginTelegram'

const Stack = createStackNavigator()

@observer
export class Planning extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Planning"
          component={PlanningContent}
          options={{
            headerTitle: () => <PlanningHeader />,
            headerRight: () => <PlanningHeaderRight />,
            headerLeft: () => <PlanningHeaderLeft />,
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
          }}
        />
        <Stack.Screen
          name="AddTodo"
          component={AddTodo}
          options={{
            title: translate('addTodo'),
            ...sharedColors.headerExtraStyle,
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <AddButton />
                {InfoButton('infoAdd')()}
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="EditTodo"
          component={AddTodo}
          options={{
            title: translate('editTodo'),
            ...sharedColors.headerExtraStyle,
            headerRight: InfoButton('infoEdit'),
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: translate('pleaseLogin'),
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={Paywall}
          options={{
            title: translate('subscription'),
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
          }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsOfUse}
          options={{
            title: translate('termsOfUse'),
            ...sharedColors.headerExtraStyle,
          }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyPolicy}
          options={{
            title: translate('privacyPolicy'),
            ...sharedColors.headerExtraStyle,
          }}
        />
        <Stack.Screen
          name="LoginTelegram"
          component={LoginTelegram}
          options={{
            title: translate('loginTelegram'),
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
          }}
        />
      </Stack.Navigator>
    )
  }
}
