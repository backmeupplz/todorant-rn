import { translate } from '@utils/i18n'

export function headerBackButtonProps(headerBackTitleVisible = true) {
  return {
    headerBackTitle: translate('back'),
    headerTruncatedBackTitle: translate('back'),
    headerBackTitleVisible,
  }
}
