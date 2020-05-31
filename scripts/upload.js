const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const fs = require('fs')
const flatten = require('flat')
const i18nStringsFiles = require('i18n-strings-files')

const files = fs.readdirSync(`${__dirname}/../src/@assets/translations`)

const localizations = {}

for (const fileName of files) {
  let fileNameLeft = fileName.split('.')[0]
  if (fileNameLeft === 'uk') {
    fileNameLeft = 'ua'
  }
  localizations[fileNameLeft] = flatten(
    JSON.parse(
      fs.readFileSync(
        `${__dirname}/../src/@assets/translations/${
          fileName.split('.')[0]
        }.json`,
        'utf8'
      )
    )
  )
}

const result = {}

const keys = Array.from(
  Object.keys(localizations)
    .map((key) => {
      const names = Object.keys(localizations[key])
      return names
    })
    .reduce((p, c) => {
      c.forEach((e) => p.add(e))
      return p
    }, new Set())
)

keys.forEach((key) => {
  const keyObject = {}
  for (const language in localizations) {
    if (localizations[language][key]) {
      keyObject[language] = localizations[language][key]
    }
  }
  result[key] = keyObject
})

// iOS permissions

const locales = ['en', 'es', 'it', 'pt-BR', 'ru', 'uk']
const iosStrings = {}
for (const locale of locales) {
  iosStrings[locale] = i18nStringsFiles.readFileSync(
    `${__dirname}/../ios/${locale}.lproj/InfoPlist.strings`,
    'UTF-8'
  )
}
const reversedIosStrings = {}
for (const locale in iosStrings) {
  for (const key in iosStrings[locale]) {
    if (!reversedIosStrings[key]) {
      reversedIosStrings[key] = {}
    }
    reversedIosStrings[key][locale] = iosStrings[locale][key]
  }
}

// Metadata iOS

const languages = ['en-US', 'es-ES', 'es-MX', 'it', 'pt-BR', 'ru', 'uk']
const iosMetadata = {}
for (const language of languages) {
  const description = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/description.txt`,
    'utf-8'
  )
  const keywords = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/keywords.txt`,
    'utf-8'
  )
  const name = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/name.txt`,
    'utf-8'
  )
  const promotional_text = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/promotional_text.txt`,
    'utf-8'
  )
  const release_notes = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/release_notes.txt`,
    'utf-8'
  )
  const subtitle = fs.readFileSync(
    `${__dirname}/../ios/fastlane/metadata/${language}/subtitle.txt`,
    'utf-8'
  )

  const map = { 'en-US': 'en', 'es-ES': 'es', 'es-MX': 'es' }

  const languageTag = map[language] || language

  const keys = {
    description: description,
    keywords: keywords,
    name: name,
    promotional_text: promotional_text,
    release_notes: release_notes,
    subtitle: subtitle,
  }

  for (const k in keys) {
    if (!iosMetadata[`metadata.${k}`]) {
      iosMetadata[`metadata.${k}`] = {}
    }
    iosMetadata[`metadata.${k}`][languageTag] = keys[k]
  }
}

;(async function postLocalizations() {
  console.log('==== Posting body:')
  console.log(JSON.stringify(result, undefined, 2))
  try {
    // await axios.post(`http://localhost:1337/localizations`, {
    await axios.post(`https://localizer.todorant.com/localizations`, {
      localizations: result,
      password: process.env.PASSWORD,
      username: 'borodutch',
      tags: ['mobile'],
    })
    console.error(`==== Body posted!`)
    console.log('==== Posting ios strings body:')
    console.log(JSON.stringify(reversedIosStrings, undefined, 2))
    await axios.post(`https://localizer.todorant.com/localizations`, {
      localizations: reversedIosStrings,
      password: process.env.PASSWORD,
      username: 'borodutch',
      tags: ['ios-permissions'],
    })
    console.error(`==== iOS strings body posted!`)
    console.log('==== Posting ios metadata body:')
    console.log(JSON.stringify(iosMetadata, undefined, 2))
    await axios.post(`https://localizer.todorant.com/localizations`, {
      localizations: iosMetadata,
      password: process.env.PASSWORD,
      username: 'borodutch',
      tags: ['metadata'],
    })
    console.error(`==== iOS metadata body posted!`)
  } catch (err) {
    console.error(`==== Error posting: ${err.message}`)
  }
})()
