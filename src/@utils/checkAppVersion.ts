import { translate } from '@utils/i18n'
import { Alert, Linking, NativeModules, Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
const axios = require('axios')
const semver = require('semver')

const platform = Platform.OS
const bundleId = NativeModules.RNDeviceInfo.bundleId
const currentVersion = NativeModules.RNDeviceInfo.appVersion

export async function checkAppVersion() {
  try {
    const version = await lookupVersion(platform, bundleId)
    if (!version.url) {
      return
    }
    const url = version.url
    if (version.needsUpdate) {
      Alert.alert(
        `${translate('updateVersionTitle')} ${version.version}!`,
        translate('updateVersionMsg'),
        [
          {
            text: translate('ok'),
            style: 'cancel',
          },
          {
            text: translate('update'),
            onPress: () => Linking.openURL(url),
          },
        ],
        { cancelable: false }
      )
    }
  } catch (err) {
    console.warn(err)
  }
}

async function lookupVersion(
  platform: string,
  bundleId: string,
  country: string = 'us'
) {
  // https://github.com/flexible-agency/react-native-check-version/blob/5d305a38064e7305eb372ffa61815822f3d839ef/backend/lib/utils.js#L5
  const installerPackageName = await DeviceInfo.getInstallerPackageName()
  let data
  let url
  switch (platform) {
    case 'ios':
      url = `http://itunes.apple.com/lookup?lang=en&bundleId=${bundleId}&country=${country}`
      data = await axios.get(url)
      if (!data.data || !('results' in data.data)) {
        throw new Error('Unknown error connecting to iTunes.')
      }
      if (!data.data.results.length) {
        throw new Error('App for this bundle ID not found.')
      }
      data = data.data.results[0]

      data = {
        version: data.version || null,
        released: data.currentVersionReleaseDate || data.releaseDate || null,
        notes: data.releaseNotes || '',
        url: data.trackViewUrl || data.artistViewUrl || data.sellerUrl || null,
        country,
        lastChecked: new Date().toISOString(),
      }

    case 'android':
      url = `https://play.google.com/store/apps/details?id=${bundleId}&hl=en`
      try {
        data = await axios.get(url)
      } catch (err) {
        if (
          err.response &&
          err.response.status &&
          err.response.status === 404
        ) {
          throw new Error(
            `App with bundle ID "${bundleId}" not found in Google Play.`
          )
        }
        throw err
      }
      data = data.data

      let startToken = 'Current Version'
      let endToken = 'Requires'
      let indexStart = data.indexOf(startToken)
      data = data.substr(indexStart + startToken.length)
      let indexEnd = data.indexOf(endToken)
      data = data
        .substr(0, indexEnd)
        .replace(/<[^>]+>/g, '')
        .trim()

      data = {
        version: data || null,
        released: new Date(),
        notes: '',
        url:
          installerPackageName === 'com.huawei.appmarket'
            ? 'https://appgallery.huawei.com/#/app/C102992095'
            : `https://play.google.com/store/apps/details?id=${bundleId}`,
        lastChecked: new Date().toISOString(),
      }
  }
  const version = await versionCompare(currentVersion, data?.version)
  return { platform, bundleId, ...data, ...version }
}

async function versionCompare(currentVersion: string, latestVersion: string) {
  // https://github.com/flexible-agency/react-native-check-version/blob/5d305a38064e7305eb372ffa61815822f3d839ef/backend/api/version.js#L24
  if (!latestVersion) {
    return {
      needsUpdate: false,
      updateType: null,
      notice: 'Error: could not get latest version',
    }
  }
  try {
    const needsUpdate = semver.lt(currentVersion, latestVersion, true)
    const updateType = needsUpdate
      ? diffLoose(currentVersion, latestVersion)
      : null
    return {
      needsUpdate,
      updateType,
    }
  } catch (e) {
    let needsUpdate =
      currentVersion !== latestVersion && latestVersion > currentVersion
    if (!latestVersion.includes('.')) {
      needsUpdate = false
    }
    const updateType = needsUpdate ? 'minor' : null
    return {
      needsUpdate,
      updateType,
      notice: e.message.replace(
        /^Invalid Version:/,
        'Not a valid semver version:'
      ),
    }
  }
}

function diffLoose(currentVersion: string, latestVersion: string) {
  // https://github.com/flexible-agency/react-native-check-version/blob/5d305a38064e7305eb372ffa61815822f3d839ef/backend/api/version.js#L4
  if (semver.eq(currentVersion, latestVersion, true)) {
    return null
  }
  const current = semver.parse(currentVersion, true)
  const latest = semver.parse(latestVersion, true)
  let prefix = ''
  let defaultResult = null
  if (current.prerelease.length || latest.prerelease.length) {
    prefix = 'pre'
    defaultResult = 'prerelease'
  }
  for (let key in current) {
    if (
      current.hasOwnProperty(key) &&
      ['major', 'minor', 'patch'].includes(key) &&
      current[key] !== latest[key]
    ) {
      return prefix + key
    }
  }
  return defaultResult
}
