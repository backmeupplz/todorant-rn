import React, { Component } from 'react'
import { Text, ActionSheet } from 'native-base'
import { sharedSettingsStore, ColorMode } from '@stores/SettingsStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { computed, makeObservable } from 'mobx'
import RNRestart from 'react-native-restart'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { TableItem } from '@components/TableItem'
import { updateAndroidNavigationBarColor } from '@utils/androidNavigationBar'
import { sockets } from '@utils/sockets'
import PushNotification from 'react-native-push-notification'
import {
  getNotificationPermissions,
  updateBadgeNumber,
  resetBadgeNumber,
} from '@utils/notifications'
import { TextAndSwitch } from '@views/settings/TextAndSwitch'
import { Language } from '@models/Language'

const codeToName = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українськa',
  it: 'Italiano',
  es: 'Español',
  'pt-BR': 'Português Brasileiro',
}

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

  componentWillMount() {
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
              { label: 'Português Brasileiro', code: 'pt-BR' },
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
                  await AsyncStorage.setItem('languageSelect', Language.auto)
                  RNRestart.Restart()
                } else if (i < 7) {
                  sharedSettingsStore.language = options[i].code
                  sharedSettingsStore.updatedAt = new Date()
                  sockets.settingsSyncManager.sync()
                  await AsyncStorage.setItem('languageSelect', options[i].code)
                  RNRestart.Restart()
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
        {!!sharedSessionStore.user && (
          <TableItem
            onPress={() => {
              navigate('Integrations')
            }}
          >
            <Text
              style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
            >
              {translate('integrations')}
            </Text>
          </TableItem>
        )}
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
                  const gotPermissions = await PushNotification.requestPermissions(
                    ['badge']
                  )
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
