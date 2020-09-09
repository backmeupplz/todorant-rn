import analytics from '@react-native-firebase/analytics'

export function logEvent(name: string) {
  asyncLogEvent(name)
}

async function asyncLogEvent(name: string) {
  try {
    await analytics().logEvent(name)
  } catch (err) {
    // Do nothing
  }
}
