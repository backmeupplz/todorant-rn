export class OnboardingButton {
  action: () => void
  message?: string
  preferred?: boolean
  notAllowed?: boolean

  constructor(
    action: () => void,
    message?: string,
    preferred?: boolean,
    notAllowed?: boolean
  ) {
    this.action = action
    this.message = message
    this.preferred = preferred
    this.notAllowed = notAllowed
  }
}
