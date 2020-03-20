import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { TermsOfUse } from './TermsOfUse'
import { navigate } from '@utils/navigation'
import { PrivacyPolicy } from './PrivacyPolicy'
import { Login } from './Login'
import { LoginLogoutButtons } from './LoginLogoutButtons'
import { AccountInfo } from './AccountInfo'
import { Sockets } from './Sockets'
import { observer } from 'mobx-react'
import { sharedSocketStore } from '@stores/SocketStore'
import { CheckOrCross } from '@components/CheckOrCross'
import { Data } from './Data'
import DeviceInfo from 'react-native-device-info'
import { TodoSettings } from './TodoSettings'
import { Rules } from './Rules'
import { Alert, Linking } from 'react-native'
import { Paywall } from './Paywall'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'

const Stack = createStackNavigator()

@observer
export class SettingsContent extends Component {
  render() {
    return (
      <Container>
        <Content>
          <List>
            <ListItem itemHeader first>
              <Text>{translate('account')}</Text>
            </ListItem>
            <AccountInfo />
            <LoginLogoutButtons />
            <ListItem itemHeader>
              <Text>{translate('todos')}</Text>
            </ListItem>
            <TodoSettings />
            <ListItem itemHeader>
              <Text>{translate('general')}</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Sockets')
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <Text>{translate('socketsInfo')}</Text>
              <CheckOrCross ok={sharedSocketStore.connected} />
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Data')
              }}
            >
              <Text>{translate('dataInfo')}</Text>
            </ListItem>
            <ListItem itemHeader>
              <Text>{translate('info')}</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Rules')
              }}
            >
              <Text>{translate('howToUse')}</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Terms')
              }}
            >
              <Text>{translate('termsOfUse')}</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Privacy')
              }}
            >
              <Text>{translate('privacyPolicy')}</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                setTimeout(() => {
                  Alert.alert(translate('support'), translate('supportText'), [
                    {
                      text: translate('cancel'),
                      style: 'cancel',
                    },
                    {
                      text: 'n@borodutch.com',
                      onPress: () => {
                        Linking.openURL('mailto:n@borodutch.com')
                      },
                    },
                    {
                      text: '@borodutch',
                      onPress: () => {
                        Linking.openURL('https://t.me/borodutch')
                      },
                    },
                  ])
                }, 500)
              }}
            >
              <Text>{translate('support')}</Text>
            </ListItem>
            <ListItem>
              <Text>
                v{DeviceInfo.getVersion()}
                {__DEV__ ? '.dev' : ''}
              </Text>
            </ListItem>
            {__DEV__ && (
              <>
                <ListItem itemHeader>
                  <Text>Debug</Text>
                </ListItem>
                <ListItem>
                  <Text>
                    {JSON.stringify(sharedSessionStore.user, undefined, 2)}
                  </Text>
                </ListItem>
              </>
            )}
          </List>
        </Content>
      </Container>
    )
  }
}

export function Settings() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsContent}
        options={{ title: translate('settings') }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsOfUse}
        options={{ title: translate('termsOfUse') }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyPolicy}
        options={{ title: translate('privacyPolicy') }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'login' }}
      />
      <Stack.Screen
        name="Sockets"
        component={Sockets}
        options={{ title: translate('socketsInfo') }}
      />
      <Stack.Screen
        name="Data"
        component={Data}
        options={{ title: translate('dataInfo') }}
      />
      <Stack.Screen
        name="Rules"
        component={Rules}
        options={{ title: translate('howTo') }}
      />
      <Stack.Screen
        name="Paywall"
        component={Paywall}
        options={{
          title: translate('subscription'),
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  )
}
