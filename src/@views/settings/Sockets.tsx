import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { CheckOrCross } from '@components/CheckOrCross'
import { sharedSocketStore } from '@stores/SocketStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'

@observer
class Row extends Component<{ title: string; ok: boolean }> {
  render() {
    return (
      <ListItem {...sharedColors.listItemExtraStyle}>
        <Text {...sharedColors.textExtraStyle}>{this.props.title}</Text>
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
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
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
              <ListItem {...sharedColors.listItemExtraStyle}>
                <Text {...sharedColors.textExtraStyle}>
                  {translate('socketError')}
                </Text>
                <Text {...sharedColors.textExtraStyle}>
                  {sharedSocketStore.connectionError.message}
                </Text>
              </ListItem>
            )}
          </List>
        </Content>
      </Container>
    )
  }
}
