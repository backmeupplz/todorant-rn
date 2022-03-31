import { ActionSheet, Text } from 'native-base'
import { ColorMode, sharedSettingsStore } from '@stores/SettingsStore'
import { Language } from '@models/Language'
import { MMKV } from '@stores/hydration/hydrate'
import { Platform } from 'react-native'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { TextAndSwitch } from '@views/settings/TextAndSwitch'
import { View } from 'react-native'
import { computed, makeObservable } from 'mobx'
import { configCalendar } from '@utils/configCalendar'
import {
  getNotificationPermissions,
  resetBadgeNumber,
  updateBadgeNumber,
} from '@utils/notifications'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { translate } from '@utils/i18n'
import { updateAndroidNavigationBarColor } from '@utils/androidNavigationBar'
import PushNotification from 'react-native-push-notification'
import React, { Component } from 'react'

const codeToName = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українськa',
  it: 'Italiano',
  es: 'Español',
  'pt-br': 'Português Brasileiro',
}

export let integrationButtonsNodeId: number

@observer
export class GeneralSettings extends Component {
  @computed get languageLabel() {
    return sharedSettingsStore.language === Language.auto
      ? translate('languageAuto')
      : (codeToName as any)[sharedSettingsStore.language || 'en']
  }

  @computed get colorModeLabel() {
    switch (sharedSettingsStore.colorMode) {
      case ColorMode.auto:
        return translate('languageAuto')
      case ColorMode.dark:
        return translate('dark')
      case ColorMode.light:
        return translate('light')
      default:
        return ''
    }
  }

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <>
        <TableItem
          onPress={() => {
            const options = [
              { label: translate('languageAuto'), code: 'en' },
              { label: 'English', code: 'en' },
              { label: 'Русский', code: 'ru' },
              { label: 'Українська', code: 'uk' },
              { label: 'Italiano', code: 'it' },
              { label: 'Español', code: 'es' },
              { label: 'Português Brasileiro', code: 'pt-br' },
            ]
            ActionSheet.show(
              {
                options: options
                  .map((v) => v.label)
                  .concat(translate('cancel')),
                cancelButtonIndex: 7,
                destructiveButtonIndex: 7,
                title: '',
              },
              async (i) => {
                if (i === 0) {
                  await MMKV.setItem('languageSelect', Language.auto)
                } else if (i < 7) {
                  sharedSettingsStore.language = options[i].code
                  sharedSettingsStore.updatedAt = new Date()
                  await MMKV.setItem('languageSelect', options[i].code)
                  configCalendar(options[i].code)
                  await sharedSync.sync(SyncRequestEvent.Settings)
                }
              }
            )
          }}
        >
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('languageSelect')}
          </Text>
          <Text {...sharedColors.regularTextExtraStyle}>
            {this.languageLabel}
          </Text>
        </TableItem>
        <TableItem
          onPress={() => {
            const options = [
              { label: translate('languageAuto'), mode: ColorMode.auto },
              { label: translate('dark'), mode: ColorMode.dark },
              { label: translate('light'), mode: ColorMode.light },
            ]
            ActionSheet.show(
              {
                options: options
                  .map((v) => v.label)
                  .concat(translate('cancel')),
                cancelButtonIndex: 4,
                destructiveButtonIndex: 4,
                title: '',
              },
              async (i) => {
                if (i < 3) {
                  sharedSettingsStore.colorMode = options[i].mode
                  updateAndroidNavigationBarColor(sharedSettingsStore.isDark)
                }
              }
            )
          }}
        >
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('colorMode')}
          </Text>
          <Text {...sharedColors.regularTextExtraStyle}>
            {this.colorModeLabel}
          </Text>
        </TableItem>
        <View>
          <TableItem
            onLayout={({ nativeEvent: { target } }: any) => {
              integrationButtonsNodeId = target
            }}
            onPress={() => {
              sharedSessionStore.user
                ? navigate('Integrations')
                : navigate('Login')
            }}
          >
            <Text
              style={{
                flex: 1,
                ...sharedColors.regularTextExtraStyle.style,
              }}
            >
              {translate('integrations')}
            </Text>
          </TableItem>
        </View>
        {!!sharedSessionStore.user && (
          <TableItem
            onPress={() => {
              navigate('Security')
            }}
          >
            <Text
              style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
            >
              {translate('security')}
            </Text>
          </TableItem>
        )}
        <TextAndSwitch
          title="soundEffects"
          value={sharedSettingsStore.soundOn}
          onValueChange={(val) => {
            sharedSettingsStore.soundOn = val
          }}
        />
        {!sharedSettingsStore.soundOn && (
          <TextAndSwitch
            title="endOfDaySoundOn"
            value={sharedSettingsStore.endOfDaySoundOn}
            onValueChange={(val) => {
              sharedSettingsStore.endOfDaySoundOn = val
            }}
          />
        )}
        <TextAndSwitch
          title="gamification"
          value={sharedSettingsStore.gamificationOn}
          onValueChange={(val) => {
            sharedSettingsStore.gamificationOn = val
          }}
        />
        <TextAndSwitch
          title="badgeIconCurrentCount"
          value={sharedSettingsStore.badgeIconCurrentCount}
          onValueChange={async (val) => {
            if (val) {
              const permissions = await getNotificationPermissions()
              if (!permissions.badge && Platform.OS === 'ios') {
                try {
                  const gotPermissions =
                    await PushNotification.requestPermissions(['badge'])
                  if (gotPermissions.badge) {
                    sharedSettingsStore.badgeIconCurrentCount = true
                    updateBadgeNumber()
                  } else {
                    sharedSettingsStore.badgeIconCurrentCount = false
                    resetBadgeNumber()
                  }
                } catch (err) {
                  sharedSettingsStore.badgeIconCurrentCount = false
                  resetBadgeNumber()
                }
              } else {
                sharedSettingsStore.badgeIconCurrentCount = val
                updateBadgeNumber()
              }
            } else {
              sharedSettingsStore.badgeIconCurrentCount = val
              resetBadgeNumber()
            }
          }}
        />
        <TextAndSwitch
          title="settingsActions.swipeActions"
          value={sharedSettingsStore.swipeActions}
          onValueChange={(val) => {
            sharedSettingsStore.swipeActions = val
          }}
        />
      </>
    )
  }
}
