import { NativeModules, Dimensions } from 'react-native'

export function getWidth() {
  return Dimensions.get('window').width
}

export function getHeight() {
  return Dimensions.get('window').height
}

export function isPad() {
  return NativeModules.PlatformConstants.interfaceIdiom === 'pad'
}

export function isLandscapeAndNotAPad(
  width = getWidth(),
  height = getHeight()
) {
  return width > height && !isPad()
}

export function isDeviceSmall() {
  return getWidth() < 400 || (getHeight() < 600 && !isLandscapeAndNotAPad())
}
