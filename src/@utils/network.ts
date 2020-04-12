import { sockets } from '@utils/sockets'
import NetInfo from '@react-native-community/netinfo'

NetInfo.addEventListener((state) => {
  if (state.isInternetReachable) {
    sockets.connect()
  }
})
