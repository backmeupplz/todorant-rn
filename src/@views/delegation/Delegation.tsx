import React, { Component } from 'react'
import { observer, Observer } from 'mobx-react'
import { Container } from 'native-base'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { createStackNavigator } from '@react-navigation/stack'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { sharedSessionStore } from '@stores/SessionStore'
import { SignupPlaceholder } from '@views/delegation/SignupPlaceholder'
import { NoDelegatedTasks } from '@views/delegation/NoDelegatedTasks'

const Stack = createStackNavigator()

@observer
export class DelegateContent extends Component {
  render() {
    return (
      <Container>
        <HeaderScrollView
          title={translate('delegate.title')}
          infoTitle="delegate.info"
        >
          {!sharedSessionStore.user && <SignupPlaceholder />}
          <NoDelegatedTasks />
        </HeaderScrollView>
      </Container>
    )
  }
}

export function Delegation() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator>
          <Stack.Screen
            name="Delegation"
            component={DelegateContent}
            options={{
              headerShown: false,
              ...headerBackButtonProps(),
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
