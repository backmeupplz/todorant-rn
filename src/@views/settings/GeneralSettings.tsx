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

const codeToName = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українськa',
  it: 'Italiano',
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
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
          onPress={() => {
            const options = [
              { label: translate('languageAuto'), code: 'en' },
              { label: 'English', code: 'en' },
              { label: 'Русский', code: 'ru' },
              { label: 'Українська', code: 'uk' },
              { label: 'Italiano', code: 'it' },
            ]
            ActionSheet.show(
              {
                options: options
                  .map((v) => v.label)
                  .concat(translate('cancel')),
                cancelButtonIndex: 5,
                destructiveButtonIndex: 5,
                title: '',
              },
              async (i) => {
                if (i === 0) {
                  await AsyncStorage.setItem('language', Language.auto)
                  RNRestart.Restart()
                } else if (i < 5) {
                  await AsyncStorage.setItem('language', options[i].code)
                  RNRestart.Restart()
                }
              }
            )
          }}
        >
          <Text style={{ flex: 1, color: sharedColors.textColor }}>
            {translate('language')}
          </Text>
          <Text {...sharedColors.textExtraStyle}>{this.languageLabel}</Text>
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
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
          <Text style={{ flex: 1, color: sharedColors.textColor }}>
            {translate('colorMode')}
          </Text>
          <Text {...sharedColors.textExtraStyle}>{this.colorModeLabel}</Text>
        </ListItem>
        {!!sharedSessionStore.user && (
          <ListItem
            onPress={() => {
              navigate('Integrations')
            }}
            style={{ borderColor: sharedColors.placeholderColor }}
          >
            <Text style={{ flex: 1, color: sharedColors.textColor }}>
              {translate('integrations')}
            </Text>
          </ListItem>
        )}
        {!!sharedSessionStore.user && (
          <ListItem
            onPress={() => {
              navigate('Security')
            }}
            style={{ borderColor: sharedColors.placeholderColor }}
          >
            <Text style={{ flex: 1, color: sharedColors.textColor }}>
              {translate('security')}
            </Text>
          </ListItem>
        )}
        <ListItem
          style={{
            borderColor: sharedColors.placeholderColor,
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ flex: 1, color: sharedColors.textColor }}>
            {translate('soundEffects')}
          </Text>
          <Switch
            value={sharedSettingsStore.soundOn}
            onValueChange={(val) => {
              sharedSettingsStore.soundOn = val
            }}
          />
        </ListItem>
      </>
    )
  }
}
