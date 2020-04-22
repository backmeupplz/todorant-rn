import { sharedAppStateStore } from '@stores/AppStateStore'
import i18n from 'i18n-js'
import * as RNLocalize from 'react-native-localize'
import { Language } from '@stores/SettingsStore'
import { AsyncStorage } from 'react-native'
import { configCalendar } from '@utils/configCalendar'

const translationGetters = {
  en: () => require('@assets/translations/en.json'),
  ru: () => require('@assets/translations/ru.json'),
  uk: () => require('@assets/translations/uk.json'),
  it: () => require('@assets/translations/it.json'),
} as { [index: string]: any }

export const translate = (key: any, config?: any) => {
  return i18n.t(key, config)
}

export async function getLanguageTag() {
  const language = (await AsyncStorage.getItem('language')) || Language.auto
  if (language !== Language.auto) {
    return language
  }
  const fallback = { languageTag: 'en' }
  const { languageTag } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback
  return languageTag
}

export function setI18nConfig() {
  i18n.translations = {
    en: translationGetters['en'](),
    ru: translationGetters['ru'](),
    uk: translationGetters['uk'](),
    it: translationGetters['it'](),
  }
}

export async function setI18nConfigAsync() {
  const languageTag = await getLanguageTag()
  i18n.locale = languageTag
  sharedAppStateStore.languageTag = languageTag
  configCalendar(languageTag)
}
