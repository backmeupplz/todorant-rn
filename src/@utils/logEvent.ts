import Countly from 'countly-sdk-react-native-bridge'
import { logEventToMicro } from '@utils/micro'

export function logEvent(name: string) {
  asyncLogEvent(name)
}

async function asyncLogEvent(name: string) {}

export async function setupAnalytics() {}
