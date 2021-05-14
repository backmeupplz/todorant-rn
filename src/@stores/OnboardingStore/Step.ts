import { OnboardingButton } from '@stores/OnboardingStore/MessageBoxButton'

export interface Step {
  nodeId?: number
  additionalButtons?: OnboardingButton[]
  messageBoxPosition?: 'above' | 'below' | 'center'
  notShowContinue?: boolean
  notShowClose?: boolean
  notShowMessage?: boolean
  predefined?: number
  divider?: number
  dontSave?: boolean
  borderRadius?: number
  heightMultiplier?: number
  customContinueText?: boolean
}
