import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions'
import { Platform } from 'react-native'

export async function checkSiriPermission() {
  if (Platform.OS === 'ios') {
    try {
      const result = await check(PERMISSIONS.IOS.SIRI)
      switch (result) {
        case RESULTS.DENIED:
          await request(PERMISSIONS.IOS.SIRI)
        default:
          break
      }
    } catch {
      // Do nothing
    }
  }
}
