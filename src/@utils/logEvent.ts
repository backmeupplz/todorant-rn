import { logEventToMicro } from '@utils/micro'
import Countly from 'countly-sdk-react-native-bridge'

export function logEvent(name: string) {
  asyncLogEvent(name)
}

async function asyncLogEvent(name: string) {
  try {
    if (await Countly.isInitialized()) {
      await Countly.sendEvent({
        eventName: name,
        eventCount: 1,
      })
    }
    try {
      await logEventToMicro(name)
    } catch {
      await Countly.sendEvent({
        eventName: 'micro_logging_failed',
        eventCount: 1,
      })
    }
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
