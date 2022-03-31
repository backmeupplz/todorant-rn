import { AccountInfo } from '@views/settings/AccountInfo'
import { AddEpic, AddEpicHeaderRight } from '@views/epics/AddEpic'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import {
  ChangeText,
  ChangeTextHeaderRight,
} from 'src/@views/settings/ChangeText'
import { CheckOrCross } from '@components/CheckOrCross'
import {
  ColorPicker,
  ColorPickerHeaderRight,
} from '@views/settings/ColorPicker'
import { Container, Text, View } from 'native-base'
import { Data } from '@views/settings/Data'
import { DebugButtons } from '@views/settings/DebugButtons'
import { DelegationSettings } from 'src/@views/settings/DelegationSettings'
import { DelegationUserScreen } from 'src/@views/settings/DelegationUserScreen'
import { Divider } from '@components/Divider'
import { FlatList } from 'react-native-gesture-handler'
import { GeneralSettings } from '@views/settings/GeneralSettings'
import { GoogleCalendar } from '@views/settings/integrations/GoogleCalendar'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { InfoButton } from '@components/InfoButton'
import { Integrations } from '@views/settings/integrations/Integrations'
import { InteractionManager, ScrollView } from 'react-native'
import { Login } from '@views/settings/Login/Login'
import { LoginFacebook } from '@views/settings/Login/LoginFacebook'
import { LoginLogoutButtons } from '@views/settings/Login/LoginLogoutButtons'
import { LoginQR } from '@views/settings/Login/LoginQR'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { Observer, observer } from 'mobx-react'
import { Paywall } from '@views/settings/Paywall'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { Rules } from '@views/settings/Rules'
import { SectionHeader } from '@components/SectionHeader'
import { Security } from '@views/settings/Security'
import { Sockets } from '@views/settings/Sockets'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { Tags } from '@views/settings/Tags'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { TodoSettings } from '@views/settings/TodoSettings'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { alertError, alertSupport } from '@utils/alert'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { navigate } from '@utils/navigation'
import { setSettingsScrollOffset } from '@utils/settingsScrollOffset'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { translate } from '@utils/i18n'
import { useNavigation } from '@react-navigation/native'
import DeviceInfo from 'react-native-device-info'
import React, { Component, createRef, useEffect } from 'react'
import fonts from '@utils/fonts'

export const scrollViewRef = createRef<FlatList<any>>()
export let supportButtonNodeId: number
export let settingsRootRef: Container
export let settingsBeforeFeedbackButton: number
export let howToUseNodeId: number

export let settingsContentRef: View

const Stack = createStackNavigator()

const codePushVersion = require('@utils/version.json').version.split('.')[0]
@observer
export class SettingsContent extends Component {
  render() {
    return (
      <Container>
        <HeaderScrollView
          onScrollViewContentRef={(ref) => {
            settingsContentRef = ref
          }}
          onscrollViewRef={scrollViewRef}
          onOffsetChange={setSettingsScrollOffset}
          title={translate('settings')}
          infoTitle="infoSettings"
        >
          <View
            onLayout={({ nativeEvent: { target } }: any) => {
              settingsBeforeFeedbackButton = target
            }}
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
              <Text
                onLayout={({ nativeEvent: { target } }: any) => {
                  howToUseNodeId = target
                }}
                {...sharedColors.regularTextExtraStyle}
              >
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
            {/* Delegation */}
            {!!sharedSessionStore.user && (
              <>
                <Divider />
                <SectionHeader title={translate('delegate.title')} />
                <DelegationSettings />
              </>
            )}
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
                <CheckOrCross ok={sharedSync.socketConnection.connected} />
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
                InteractionManager.runAfterInteractions(() => {
                  sharedOnboardingStore.nextStep(TutorialStep.Start)
                  sharedOnboardingStore.tutorialIsShown = false
                })
              }}
            >
              <Text
                style={{
                  color: sharedColors.textColor,
                  fontFamily: fonts.SFProTextRegular,
                }}
              >
                {translate('tutorialButton')}
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
          </View>
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
              onLayout={({ nativeEvent: { target } }: any) => {
                supportButtonNodeId = target
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
  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        if (!sharedSync.socketConnection.authorized) return
        await sharedSync.sync(SyncRequestEvent.All)
      } catch (err) {
        alertError(err as string)
      }
    })
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

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
            name="LoginFacebook"
            component={LoginFacebook}
            options={{
              title: translate('loginFacebook'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
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
              title: translate('epic.intoEpic'),
              headerTitleAlign: 'center',
              headerRight: () => <AddEpicHeaderRight />,
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="ChangeText"
            component={ChangeText}
            options={{
              title: translate('editHashtag'),
              headerTitleAlign: 'center',
              headerRight: () => <ChangeTextHeaderRight />,
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
          <Stack.Screen
            name="Delegators"
            component={DelegationUserScreen}
            options={{
              title: translate('delegate.delegators'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              ...headerBackButtonProps(),
            }}
          />
          <Stack.Screen
            name="Delegates"
            component={DelegationUserScreen}
            options={{
              title: translate('delegate.delegates'),
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
