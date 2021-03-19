import { NativeScrollPoint } from 'react-native'

export let settingsScrollOffset: NativeScrollPoint = { x: 0, y: 0 }
export function setSettingsScrollOffset(point: NativeScrollPoint) {
  settingsScrollOffset.x = point.x
  settingsScrollOffset.y = point.y
}
