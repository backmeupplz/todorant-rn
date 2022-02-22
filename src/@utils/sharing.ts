import { alertError } from '@utils/alert'
import { navigate } from '@utils/navigation'
import ReceiveSharingIntent from 'react-native-receive-sharing-intent'

let sharedText = ''

ReceiveSharingIntent.getReceivedFiles(
  (files: any) => {
    let result = [] as string[]
    for (const file of files) {
      if (file.text || file.weblink) {
        result.push(file.text || file.weblink)
      }
    }
    sharedText = result.join(', ')
    if (sharedText) {
      ReceiveSharingIntent.clearReceivedFiles()
      navigate('AddTodo', { text: sharedText })
      sharedText = ''
    }
  },
  (error: any) => {
    alertError(error as string)
  }
)
ReceiveSharingIntent.clearReceivedFiles()

export function checkSharedContent() {
  if (sharedText) {
    ReceiveSharingIntent.clearReceivedFiles()
    navigate('AddTodo', { text: sharedText })
    sharedText = ''
  }
}
