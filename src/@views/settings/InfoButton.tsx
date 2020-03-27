import React, { Component } from 'react'
import { Button, Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { alertMessage } from '@utils/alert'
import { translate } from '@utils/i18n'

export class InfoButtonContent extends Component<{ message: string }> {
  render() {
    return (
      <Button
        icon
        transparent
        onPress={() => {
          alertMessage(translate('infoTitle'), translate(this.props.message))
        }}
      >
        <Icon
          type="MaterialIcons"
          name="info-outline"
          {...sharedColors.iconExtraStyle}
          {...sharedColors.iconExtraStyle}
        />
      </Button>
    )
  }
}

export const InfoButton = (message: string) => () => (
  <InfoButtonContent message={message} />
)
