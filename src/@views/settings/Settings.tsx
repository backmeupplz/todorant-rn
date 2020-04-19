import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, List, ListItem, Text, Button } from 'native-base'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { navigate } from '@utils/navigation'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { Login } from '@views/settings/Login'
import { LoginLogoutButtons } from '@views/settings/LoginLogoutButtons'
import { AccountInfo } from '@views/settings/AccountInfo'
import { Sockets } from '@views/settings/Sockets'
import { observer, Observer } from 'mobx-react'
import { sharedSocketStore } from '@stores/SocketStore'
import { CheckOrCross } from '@components/CheckOrCross'
import { Data } from '@views/settings/Data'
import DeviceInfo from 'react-native-device-info'
import { TodoSettings } from '@views/settings/TodoSettings'
import { Rules } from '@views/settings/Rules'
import { Alert, Linking } from 'react-native'
import { Paywall } from '@views/settings/Paywall'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import {
  deleteAllTodos,
  addTodosEn,
  addTodosRu,
  addTodosUk,
} from '@utils/debug'
import { LoginTelegram } from '@views/settings/LoginTelegram'
import { IntroMessage } from '@views/settings/IntroMessage'
import { InfoButton } from '@views/settings/InfoButton'
import { GeneralSettings } from '@views/settings/GeneralSettings'
import { Tags } from '@views/settings/Tags'
import { ColorPicker, ColorPickerHeaderRight } from './ColorPicker'

const Stack = createStackNavigator()

const codePushVersion = 17

@observer
export class SettingsContent extends Component {
  render() {
    return (
      <Container>
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          <List>
            {__DEV__ && (
              <>
                <Button
                  onPress={() => {
                    deleteAllTodos()
                  }}
                  accessible
                  accessibilityLabel="delete"
                  testID="delete"
                >
                  <Text {...sharedColors.textExtraStyle}>delete all todos</Text>
                </Button>
                <Button
                  onPress={() => {
                    addTodosRu()
                  }}
                  accessible
                  accessibilityLabel="add_ru"
                  testID="add_ru"
                >
                  <Text {...sharedColors.textExtraStyle}>add ru todos</Text>
                </Button>
                <Button
                  onPress={() => {
                    addTodosEn()
                  }}
                  accessible
                  accessibilityLabel="add_en"
                  testID="add_en"
                >
                  <Text {...sharedColors.textExtraStyle}>add en todos</Text>
                </Button>
                <Button
                  onPress={() => {
                    addTodosUk()
                  }}
                  accessible
                  accessibilityLabel="add_uk"
                  testID="add_uk"
                >
                  <Text {...sharedColors.textExtraStyle}>add uk todos</Text>
                </Button>
              </>
            )}
            <ListItem itemHeader first>
              <Text style={{ color: sharedColors.placeholderColor }}>
                {translate('account')}
              </Text>
            </ListItem>
            <AccountInfo />
            <LoginLogoutButtons />
            <ListItem itemHeader>
              <Text style={{ color: sharedColors.placeholderColor }}>
                {translate('todos')}
              </Text>
            </ListItem>
            <TodoSettings />
            <ListItem itemHeader>
              <Text style={{ color: sharedColors.placeholderColor }}>
                {translate('general')}
              </Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Sockets')
              }}
              style={{
                justifyContent: 'space-between',
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('socketsInfo')}
              </Text>
              <CheckOrCross ok={sharedSocketStore.connected} />
            </ListItem>
            <ListItem
              button
              onPress={() => {
                navigate('Data')
              }}
              style={{ borderColor: sharedColors.placeholderColor }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('dataInfo')}
              </Text>
            </ListItem>
            <GeneralSettings />
            <ListItem itemHeader>
              <Text style={{ color: sharedColors.placeholderColor }}>
                {translate('info')}
              </Text>
            </ListItem>
            <ListItem
              button
              style={{ borderColor: sharedColors.placeholderColor }}
              onPress={() => {
                navigate('Rules')
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('howToUse')}
              </Text>
            </ListItem>
            <ListItem
              button
              style={{ borderColor: sharedColors.placeholderColor }}
              onPress={() => {
                navigate('Intro')
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('introButton')}
              </Text>
            </ListItem>
            <ListItem
              button
              style={{ borderColor: sharedColors.placeholderColor }}
              onPress={() => {
                navigate('Terms')
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('termsOfUse')}
              </Text>
            </ListItem>
            <ListItem
              button
              style={{ borderColor: sharedColors.placeholderColor }}
              onPress={() => {
                navigate('Privacy')
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('privacyPolicy')}
              </Text>
            </ListItem>
            <ListItem
              button
              style={{ borderColor: sharedColors.placeholderColor }}
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
              <Text {...sharedColors.textExtraStyle}>
                {translate('support')}
              </Text>
            </ListItem>
            <ListItem style={{ borderColor: sharedColors.placeholderColor }}>
              <Text style={{ color: sharedColors.placeholderColor }}>
                v{DeviceInfo.getVersion()}.{codePushVersion}
                {__DEV__ ? '.dev' : ''}
              </Text>
            </ListItem>
            {__DEV__ && (
              <>
                <ListItem
                  itemHeader
                  style={{ borderColor: sharedColors.placeholderColor }}
                >
                  <Text style={{ color: sharedColors.placeholderColor }}>
                    Debug
                  </Text>
                </ListItem>
                <ListItem
                  style={{ borderColor: sharedColors.placeholderColor }}
                >
                  <Text {...sharedColors.textExtraStyle}>
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
    <Observer>
      {() => (
        <Stack.Navigator>
          <Stack.Screen
            name="Settings"
            component={SettingsContent}
            options={{
              title: translate('settings'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoSettings'),
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
            name="Login"
            component={Login}
            options={{
              title: translate('pleaseLogin'),
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Sockets"
            component={Sockets}
            options={{
              title: translate('socketsInfo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoSockets'),
            }}
          />
          <Stack.Screen
            name="Data"
            component={Data}
            options={{
              title: translate('dataInfo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoData'),
            }}
          />
          <Stack.Screen
            name="Rules"
            component={Rules}
            options={{
              title: translate('howTo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoRules'),
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
            name="LoginTelegram"
            component={LoginTelegram}
            options={{
              title: translate('loginTelegram'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Intro"
            component={IntroMessage}
            options={{
              title: translate('introTitle'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoIntro'),
            }}
          />
          <Stack.Screen
            name="Tags"
            component={Tags}
            options={{
              title: translate('tags'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoTags'),
            }}
          />
          <Stack.Screen
            name="ColorPicker"
            component={ColorPicker}
            options={{
              title: translate('changeColor'),
              headerTitleAlign: 'center',
              headerRight: () => <ColorPickerHeaderRight />,
              ...sharedColors.headerExtraStyle,
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
