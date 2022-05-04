import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions'
import { Platform } from 'react-native'

export async function checkSiriPermission() {
  if (Platform.OS === 'ios') {
    try {
      const result = await check(PERMISSIONS.IOS.SIRI)
      if (result === RESULTS.DENIED) {
        await request(PERMISSIONS.IOS.SIRI)
      }
    } catch {
      // Do nothing
    }
  }
}
