import { MessageBoxButton } from '@stores/OnboardingStore/MessageBoxButton'

export interface Step {
  nodeId?: number
  additionalButtons?: MessageBoxButton[]
  messageBoxPosition?: 'above' | 'below' | 'center'
  notShowContinue?: boolean
  notShowClose?: boolean
  predefined?: number
  divider?: number
  dontSave?: boolean
  borderRadius?: number
  heightMultiplier?: number
}
