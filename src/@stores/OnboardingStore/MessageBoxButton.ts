export interface MessageBoxButton {
  action: () => void
  message?: string
  preferred?: boolean
  notAllowed?: boolean
}
