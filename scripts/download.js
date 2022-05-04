const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const fs = require('fs')
const unflatten = require('flat').unflatten
const i18nStringsFiles = require('i18n-strings-files')

;(async function getTranslations() {
  console.log('==== Getting localizations')
  const translations = (
    await axios.get('https://localizer.todorant.com/localizations?tag=mobile')
  ).data.filter((l) => {
    return l.tags.indexOf('mobile') > -1
  })
  console.log('==== Got localizations:')
  console.log(JSON.stringify(translations, undefined, 2))
  // Get flattened map
  const flattenedMap = {} // { key: {en: '', ru: ''}}
  translations.forEach((t) => {
    let key = t.key
    if (key === 'settings.duplicateTagInBreakdown') {
      key = 'settingsObject.duplicateTagInBreakdown'
    }
    const variants = t.variants.filter((v) => !!v.selected)
    flattenedMap[key] = variants.reduce((p, c) => {
      p[c.language] = c.text
      return p
    }, {})
  })
  console.log('==== Decoded response:')
  console.log(flattenedMap)
  // Reverse the map
  const reversedMap = {}
  Object.keys(flattenedMap).forEach((k) => {
    const internals = flattenedMap[k]
    for (const language in internals) {
      const text = internals[language]
      if (!reversedMap[language]) {
        reversedMap[language] = {}
      }
      reversedMap[language][k] = text
    }
  })
  console.log('==== Reversed map')
  console.log(reversedMap)
  for (let language in reversedMap) {
    const obj = reversedMap[language]
    const json = JSON.stringify(unflatten(obj), undefined, 2)
    if (language === 'ua') {
      language = 'uk'
    }
    fs.writeFileSync(
      `${__dirname}/../src/@assets/translations/${language}.json`,
      `${json}\n`
    )
  }
  console.log('==== Saved object to the file')
  console.log('==== Getting iOS permissions')
  const iOSTranslations = (
    await axios.get('https://localizer.todorant.com/localizations')
  ).data.filter((l) => {
    return l.tags.indexOf('ios-permissions') > -1
  })
  const iOSt = {}
  for (const t of iOSTranslations) {
    const key = t.key
    const variants = t.variants.filter((v) => !!v.selected)
    iOSt[key] = variants.reduce((p, c) => {
      p[c.language] = c.text
      return p
    }, {})
  }
  console.log('==== Got iOS permissions')
  const reversedIos = {}
  Object.keys(iOSt).forEach((k) => {
    const internals = iOSt[k]
    for (const language in internals) {
      const text = internals[language]
      if (!reversedIos[language]) {
        reversedIos[language] = {}
      }
      reversedIos[language][k] = text
    }
  })
  console.log(reversedIos)
  console.log('==== Saving iOS permissions')
  for (const language in reversedIos) {
    const value = reversedIos[language]

    i18nStringsFiles.writeFileSync(
      `${__dirname}/../ios/${language}.lproj/InfoPlist.strings`,
      value,
      'UTF-8'
    )
  }
  console.log('==== Saved iOS permissions')
  console.log('==== Getting iOS metadata')
  const metadataTranslations = (
    await axios.get('https://localizer.todorant.com/localizations')
  ).data.filter((l) => {
    return l.tags.indexOf('metadata') > -1
  })
  const metadata = {}
  for (const t of metadataTranslations) {
    const key = t.key.replace('metadata.', '')
    const variants = t.variants.filter((v) => !!v.selected)
    metadata[key] = variants.reduce((p, c) => {
      p[c.language] = c.text
      return p
    }, {})
  }
  console.log('==== Got iOS metadata')
  const reversedMetadata = {}
  Object.keys(metadata).forEach((k) => {
    const internals = metadata[k]
    for (const language in internals) {
      const text = internals[language]
      if (!reversedMetadata[language]) {
        reversedMetadata[language] = {}
      }
      reversedMetadata[language][k] = text
    }
  })
  console.log(reversedMetadata)
  console.log('==== Saving iOS metadata')
  const languageMap = {
    en: ['en-US'],
    es: ['es-ES', 'es-MX'],
  }

  for (const language in reversedMetadata) {
    const value = reversedMetadata[language]
    for (const lTag of languageMap[language] || [language]) {
      for (const k in value) {
        fs.writeFileSync(
          `${__dirname}/../ios/fastlane/metadata/${lTag}/${k}.txt`,
          value[k],
          'UTF-8'
        )
      }
    }
  }
  console.log('==== Saved iOS metadata')
})()
