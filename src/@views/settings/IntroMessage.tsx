import React, { Component } from 'react'
import { Container, Content, Text, Button } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import { goBack } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'

@observer
export class IntroMessage extends Component {
  componentDidMount() {
    sharedSessionStore.introMessageShown = true
  }

  render() {
    return (
      <Container>
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          {[1, 2, 3].map(i => (
            <Text
              style={{ padding: 12, color: sharedColors.textColor }}
              key={i}
            >
              {translate(`intro${i}`)}
            </Text>
          ))}
          <Text
            style={{
              flex: 1,
              padding: 12,
              textAlign: 'right',
              ...sharedColors.textExtraStyle.style,
            }}
          >
            {translate('signature')}
          </Text>
          <Button
            style={{ justifyContent: 'center', margin: 10 }}
            onPress={() => {
              goBack()
            }}
          >
            <Text>{translate('introBack')}</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
