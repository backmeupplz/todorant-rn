import React, { Component } from 'react'
import { ListItem, Text, ActionSheet } from 'native-base'
import { sharedSettingsStore, Language } from '@stores/SettingsStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { computed } from 'mobx'
import RNRestart from 'react-native-restart'
import { AsyncStorage } from 'react-native'

const codeToName = {
  en: 'English',
  ru: 'Русский',
}

@observer
export class GeneralSettings extends Component {
  @computed get languageLabel() {
    return sharedSettingsStore.language === Language.auto
      ? translate('languageAuto')
      : (codeToName as any)[sharedSettingsStore.language]
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
            ]
            ActionSheet.show(
              {
                options: options.map(v => v.label).concat(translate('cancel')),
                cancelButtonIndex: 2,
                destructiveButtonIndex: 2,
                title: '',
              },
              async i => {
                if (i === 0) {
                  await AsyncStorage.setItem('language', Language.auto)
                } else if (i < 3) {
                  await AsyncStorage.setItem('language', options[i].code)
                }
                if (i < 3) {
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
      </>
    )
  }
}
