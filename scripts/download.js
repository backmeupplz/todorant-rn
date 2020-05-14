const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const fs = require('fs')

;(async function getTranslations() {
  console.log('==== Getting localizations')
  const translations = (
    await axios.get('http://localhost:1337/localizations?tag=mobile')
  ).data.filter((l) => {
    return l.tags.indexOf('mobile') > -1
  })
  console.log('==== Got localizations:')
  console.log(JSON.stringify(translations, undefined, 2))
  // Get flattened map
  const flattenedMap = {} // { key: {en: '', ru: ''}}
  translations.forEach((t) => {
    const key = t.key
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
  for (const language in reversedMap) {
    const obj = reversedMap[language]
    const json = JSON.stringify(obj, undefined, 2)
    fs.writeFileSync(
      `${__dirname}/../src/@assets/translations/${language}.json`,
      json
    )
  }
  console.log('==== Saved object to the file')
})()
