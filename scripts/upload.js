const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/../.env` })
const axios = require('axios')
const fs = require('fs')

const files = fs.readdirSync(`${__dirname}/../src/@assets/translations`)

const localizations = {}

for (const fileName of files) {
  localizations[fileName.split('.')[0]] = JSON.parse(
    fs.readFileSync(
      `${__dirname}/../src/@assets/translations/${fileName}`,
      'utf8'
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
;(async function postLocalizations() {
  console.log('==== Posting body:')
  console.log(JSON.stringify(result, undefined, 2))
  try {
    await axios.post(`http://localhost:1337/localizations`, {
      localizations: result,
      password: process.env.PASSWORD,
      username: 'borodutch',
      tags: ['mobile'],
    })
    console.error(`==== Body posted!`)
  } catch (err) {
    console.error(`==== Error posting: ${err.message}`)
  }
})()
