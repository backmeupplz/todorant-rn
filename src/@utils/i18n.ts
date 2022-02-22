import { sharedAppStateStore } from '@stores/AppStateStore'
import i18n from 'i18n-js'
import * as RNLocalize from 'react-native-localize'
import { Language } from '@models/Language'
import { configCalendar } from '@utils/configCalendar'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { MMKV } from '@stores/hydration/hydrate'

const translationGetters = {
  en: () => require('@assets/translations/en.json'),
  ru: () => require('@assets/translations/ru.json'),
  uk: () => require('@assets/translations/uk.json'),
  it: () => require('@assets/translations/it.json'),
  es: () => require('@assets/translations/es.json'),
  'pt-br': () => require('@assets/translations/pt-BR.json'),
} as { [index: string]: any }

export const translate = (key: any, config?: any) => {
  if (
    i18n.locale !== sharedSettingsStore.language &&
    sharedSettingsStore.language
  ) {
    i18n.locale = sharedSettingsStore.language
  }
  return i18n.t(key, config)
}

export async function getLanguageTag() {
  const language = (await MMKV.getItem('languageSelect')) || Language.auto
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
    es: translationGetters['es'](),
    'pt-br': translationGetters['pt-br'](),
  }
  i18n.fallbacks = true
  i18n.defaultLocale = 'en'
}

export async function setI18nConfigAsync() {
  let languageTag = await getLanguageTag()
  if (languageTag === 'pt-BR') languageTag = 'pt-br'
  i18n.locale = languageTag
  sharedSettingsStore.language = languageTag
  configCalendar(languageTag)
}
