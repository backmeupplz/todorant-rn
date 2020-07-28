import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Text } from 'native-base'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { navigate } from '@utils/navigation'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { Login } from '@views/settings/Login/Login'
import { LoginLogoutButtons } from '@views/settings/Login/LoginLogoutButtons'
import { AccountInfo } from '@views/settings/AccountInfo'
import { Sockets } from '@views/settings/Sockets'
import { observer, Observer } from 'mobx-react'
import { sharedSocketStore } from '@stores/SocketStore'
import { CheckOrCross } from '@components/CheckOrCross'
import { Data } from '@views/settings/Data'
import DeviceInfo from 'react-native-device-info'
import { TodoSettings } from '@views/settings/TodoSettings'
import { Rules } from '@views/settings/Rules'
import { Paywall } from '@views/settings/Paywall'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { IntroMessage } from '@views/settings/IntroMessage'
import { InfoButton } from '@components/InfoButton'
import { GeneralSettings } from '@views/settings/GeneralSettings'
import { Tags } from '@views/settings/Tags'
import {
  ColorPicker,
  ColorPickerHeaderRight,
} from '@views/settings/ColorPicker'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { alertSupport } from '@utils/alert'
import { Integrations } from '@views/settings/integrations/Integrations'
import { GoogleCalendar } from '@views/settings/integrations/GoogleCalendar'
import { LoginQR } from '@views/settings/Login/LoginQR'
import { Security } from '@views/settings/Security'
import { DebugButtons } from '@views/settings/DebugButtons'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { Divider } from '@components/Divider'
import { SectionHeader } from '@components/SectionHeader'
import { TableItem } from '@components/TableItem'
import fonts from '@utils/fonts'
import { AddEpic, AddEpicHeaderRight } from '@views/epics/AddEpic'

const Stack = createStackNavigator()

const codePushVersion = require('@utils/version.json').version.split('.')[0]

@observer
export class SettingsContent extends Component {
  render() {
    return (
      <Container>
        <HeaderScrollView
          title={translate('settings')}
          infoTitle="infoSettings"
        >
          <DebugButtons />
          {/* Important */}
          <Divider />
          <SectionHeader title={translate('important')} />
          <TableItem
            onPress={() => {
              navigate('Rules')
            }}
          >
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('howToUse')}
            </Text>
          </TableItem>
          {/* Account */}
          <Divider />
          <AccountInfo />
          <LoginLogoutButtons />
          {/* Todos */}
          <Divider />
          <SectionHeader title={translate('todos')} />
          <TodoSettings />
          {/* General */}
          <Divider />
          <SectionHeader title={translate('general')} />
          {!!sharedSessionStore.user && (
            <TableItem
              onPress={() => {
                navigate('Sockets')
              }}
            >
              <Text {...sharedColors.regularTextExtraStyle}>
                {translate('socketsInfo')}
              </Text>
              <CheckOrCross ok={sharedSocketStore.connected} />
            </TableItem>
          )}
          {!!sharedSessionStore.user && (
            <TableItem
              onPress={() => {
                navigate('Data')
              }}
            >
              <Text {...sharedColors.regularTextExtraStyle}>
                {translate('dataInfo')}
              </Text>
            </TableItem>
          )}
          <GeneralSettings />
          {/* Information */}
          <Divider />
          <SectionHeader title={translate('info')} />
          <TableItem
            onPress={() => {
              navigate('Intro')
            }}
          >
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              {translate('introButton')}
            </Text>
          </TableItem>
          <TableItem
            onPress={() => {
              navigate('Terms')
            }}
          >
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              {translate('termsOfUse')}
            </Text>
          </TableItem>
          <TableItem
            onPress={() => {
              navigate('Privacy')
            }}
          >
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              {translate('privacyPolicy')}
            </Text>
          </TableItem>
          <TableItem
            onPress={() => {
              alertSupport()
            }}
          >
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              {translate('supportLabel')}
            </Text>
          </TableItem>
          <Divider />
          <TableItem>
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              v{DeviceInfo.getVersion()}.{codePushVersion}
              {__DEV__ ? '.dev' : ''}
            </Text>
          </TableItem>
          {/* {__DEV__ && (
            <>
              <ListItem itemHeader>
                <Text style={{ color: sharedColors.placeholderColor }}>
                  Debug
                </Text>
              </ListItem>
              <ListItem {...sharedColors.listItemExtraStyle}>
                <Text {...sharedColors.textExtraStyle}>
                  {JSON.stringify(sharedSessionStore.user, undefined, 2)}
                </Text>
              </ListItem>
            </>
          )} */}
        </HeaderScrollView>
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
              headerShown: false,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsOfUse}
            options={{
              title: translate('termsOfUse'),
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyPolicy}
            options={{
              title: translate('privacyPolicy'),
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: translate('pleaseLogin'),
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Sockets"
            component={Sockets}
            options={{
              title: translate('socketsInfo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoSockets'),
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Data"
            component={Data}
            options={{
              title: translate('dataInfo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoData'),
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Rules"
            component={Rules}
            options={{
              title: translate('howTo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoRules'),
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Paywall"
            component={Paywall}
            options={{
              title: translate('subscription'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="LoginTelegram"
            component={LoginTelegram}
            options={{
              title: translate('loginTelegram'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
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
              ...headerBackButtonProps(),
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
              ...headerBackButtonProps(),
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
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="AddEpic"
            component={AddEpic}
            options={{
              title: translate('epicInto'),
              headerTitleAlign: 'center',
              headerRight: () => <AddEpicHeaderRight />,
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Integrations"
            component={Integrations}
            options={{
              title: translate('integrations'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoIntegrations'),
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="GoogleCalendar"
            component={GoogleCalendar}
            options={{
              title: translate('googleCalendar'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="LoginQR"
            component={LoginQR}
            options={{
              title: translate('loginQR'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Security"
            component={Security}
            options={{
              title: translate('security'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
