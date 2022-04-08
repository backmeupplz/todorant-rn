import { InteractionManager, UIManager, findNodeHandle } from 'react-native'
import { RNHole } from '@upacyxou/react-native-hole-view'
import { rootRef } from '../../../App'

export function measurePosition(nodeId: number, rootNode = rootRef) {
  return new Promise<RNHole>((resolve, reject) => {
    UIManager.measureLayout(
      nodeId,
      findNodeHandle(rootNode) as number,
      () => {
        // If error
        reject("Can't measure position of a given node.")
      },
      // Получаем абсолютные значения нашего ref-элемента
      (x, y, width, height) => {
        InteractionManager.runAfterInteractions(async () => {
          resolve({ x, y, width, height })
        })
      }
    )
  })
}
