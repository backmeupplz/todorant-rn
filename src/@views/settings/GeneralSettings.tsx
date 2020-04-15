import React, { Component } from 'react'
import { ListItem, Text, ActionSheet } from 'native-base'
import { sharedSettingsStore, Language, ColorMode } from '@stores/SettingsStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { computed } from 'mobx'
import RNRestart from 'react-native-restart'
import { AsyncStorage } from 'react-native'

const codeToName = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українськa',
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
                if (i === 0) {
                  await AsyncStorage.setItem('language', Language.auto)
                  RNRestart.Restart()
                } else if (i < 4) {
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
      </>
    )
  }
}
