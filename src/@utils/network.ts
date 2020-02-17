import { sockets } from './sockets'
import NetInfo from '@react-native-community/netinfo'

NetInfo.addEventListener(state => {
  if (state.isInternetReachable) {
    sockets.connect()
  }
})
