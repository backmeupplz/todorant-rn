import { CheckOrCross } from '@components/CheckOrCross'
import { Component } from 'react'
import { Container, Content, Text } from 'native-base'
import { TableItem } from '@components/TableItem'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSync } from '@sync/Sync'
import { translate } from '@utils/i18n'
import React from 'react'

@observer
class Row extends Component<{ title: string; ok: boolean }> {
  render() {
    return (
      <TableItem>
        <Text {...sharedColors.textExtraStyle}>{this.props.title}</Text>
        <CheckOrCross ok={this.props.ok} />
      </TableItem>
    )
  }
}

@observer
export class Sockets extends Component {
  render() {
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedColors.backgroundColor,
            paddingTop: 16,
          }}
        >
          <Row
            title={translate('connected')}
            ok={sharedSync.socketConnection.connected}
          />
          <Row
            title={translate('authorized')}
            ok={sharedSync.socketConnection.authorized}
          />
          {sharedSync.socketConnection.connectionError && (
            <TableItem>
              <Text {...sharedColors.textExtraStyle}>
                {translate('socketError')}
              </Text>
              <Text {...sharedColors.textExtraStyle}>
                {sharedSync.socketConnection.connectionError}
              </Text>
            </TableItem>
          )}
        </Content>
      </Container>
    )
  }
}
