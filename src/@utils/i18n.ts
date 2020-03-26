import { memoize } from 'lodash'
import i18n from 'i18n-js'
import * as RNLocalize from 'react-native-localize'

const translationGetters = {
  en: () => require('@assets/translations/en.json'),
  ru: () => require('@assets/translations/ru.json'),
} as { [index: string]: any }

export const translate = memoize(
  (key, config?) => i18n.t(key, config),
  (key, config?) => (config ? key + JSON.stringify(config) : key)
)

export function getLanguageTag() {
  const fallback = { languageTag: 'en' }
  const { languageTag } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback
  return languageTag
}

export function setI18nConfig() {
  const languageTag = getLanguageTag()

  if (translate.cache.clear) {
    translate.cache.clear()
  }

  i18n.translations = { [languageTag]: translationGetters[languageTag]() }
  i18n.locale = languageTag
}
