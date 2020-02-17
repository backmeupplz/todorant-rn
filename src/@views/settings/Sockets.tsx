import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { CheckOrCross } from '@components/CheckOrCross'
import { sharedSocketStore } from '@stores/SocketStore'
import { observer } from 'mobx-react'

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
            <Row title="Connected" ok={sharedSocketStore.connected} />
            <Row title="Authorized" ok={sharedSocketStore.authorized} />
            {sharedSocketStore.connectionError && (
              <ListItem>
                <Text>Connection error: </Text>
                <Text>{sharedSocketStore.connectionError.message}</Text>
              </ListItem>
            )}
          </List>
        </Content>
      </Container>
    )
  }
}
