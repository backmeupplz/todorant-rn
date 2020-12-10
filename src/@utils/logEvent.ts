import Countly from 'countly-sdk-react-native-bridge'

export function logEvent(name: string) {
  asyncLogEvent(name)
}

async function asyncLogEvent(name: string) {
  try {
    await Countly.sendEvent({
      eventName: name,
      eventCount: 1,
    })
  } catch (err) {
    // Do nothing
  }
}

export async function setupAnalytics() {
  if (!(await Countly.isInitialized())) {
    Countly.enableCrashReporting()
    await Countly.init(
      'https://analytics.todorant.com',
      '95f6d5ac38eb653c69778a309aa53ed709463c70'
    )
    Countly.start()
  }
}
