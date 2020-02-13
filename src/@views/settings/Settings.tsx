import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, List, ListItem, Text, Button } from 'native-base'
import { TermsOfUse } from './TermsOfUse'
import { navigate } from '@utils/navigation'
import { PrivacyPolicy } from './PrivacyPolicy'
import { Login } from './Login'
import { LoginLogoutButtons } from './LoginLogoutButtons'
import { AccountInfo } from './AccountInfo'

const Stack = createStackNavigator()

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
    </Stack.Navigator>
  )
}
