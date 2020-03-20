import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { CheckOrCross } from '@components/CheckOrCross'
import { sharedSocketStore } from '@stores/SocketStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'

class Row extends Component<{ title: string; ok: boolean }> {
  render() {
    return (
      <ListItem style={{ justifyContent: 'space-between' }}>
        <Text>{this.props.title}</Text>
        <CheckOrCross ok={this.props.ok} />
      </ListItem>
    )
  }
}

@observer
export class Sockets extends Component {
  render() {
    return (
      <Container>
        <Content>
          <List>
            <Row
              title={translate('connected')}
              ok={sharedSocketStore.connected}
            />
            <Row
              title={translate('authorized')}
              ok={sharedSocketStore.authorized}
            />
            {sharedSocketStore.connectionError && (
              <ListItem>
                <Text>{translate('socketError')}</Text>
                <Text>{sharedSocketStore.connectionError.message}</Text>
              </ListItem>
            )}
          </List>
        </Content>
      </Container>
    )
  }
}
