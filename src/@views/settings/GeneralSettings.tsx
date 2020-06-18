import React, { Component } from 'react'
import { ListItem, Text, ActionSheet, Switch } from 'native-base'
import { sharedSettingsStore, Language, ColorMode } from '@stores/SettingsStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { computed } from 'mobx'
import RNRestart from 'react-native-restart'
import { AsyncStorage } from 'react-native'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { TableItem } from '@components/TableItem'

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
      : (codeToName as any)[sharedSettingsStore.language]
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
        <TableItem>
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('soundEffects')}
          </Text>
          <Switch
            value={sharedSettingsStore.soundOn}
            onValueChange={(val) => {
              sharedSettingsStore.soundOn = val
            }}
          />
        </TableItem>
        <TableItem>
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('gamification')}
          </Text>
          <Switch
            value={sharedSettingsStore.gamificationOn}
            onValueChange={(val) => {
              sharedSettingsStore.gamificationOn = val
            }}
          />
        </TableItem>
      </>
    )
  }
}
