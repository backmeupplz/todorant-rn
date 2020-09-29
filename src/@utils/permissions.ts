import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions'

export async function checkSiriPermission() {
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
