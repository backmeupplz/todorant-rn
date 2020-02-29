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

const Stack = createStackNavigator()

@observer
export class SettingsContent extends Component {
  render() {
    return (
      <Container>
        <Content>
          <List>
            <ListItem itemHeader>
              <Text>Account</Text>
            </ListItem>
            <AccountInfo />
            <LoginLogoutButtons />
            <ListItem itemHeader>
              <Text>General</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Sockets')
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <Text>Sockets info</Text>
              <CheckOrCross ok={sharedSocketStore.connected} />
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Data')
              }}
            >
              <Text>Data info</Text>
            </ListItem>
            <ListItem itemHeader>
              <Text>Info</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Terms')
              }}
            >
              <Text>Terms of use</Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Privacy')
              }}
            >
              <Text>Privacy policy</Text>
            </ListItem>
            <ListItem>
              <Text>
                v{DeviceInfo.getVersion()}
                {__DEV__ ? '.dev' : ''}
              </Text>
            </ListItem>
          </List>
        </Content>
      </Container>
    )
  }
}

export function Settings() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsContent} />
      <Stack.Screen
        name="Terms"
        component={TermsOfUse}
        options={{ title: 'Terms of use' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyPolicy}
        options={{ title: 'Privacy policy' }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="Sockets"
        component={Sockets}
        options={{ title: 'Sockets info' }}
      />
      <Stack.Screen
        name="Data"
        component={Data}
        options={{ title: 'Data info' }}
      />
    </Stack.Navigator>
  )
}
