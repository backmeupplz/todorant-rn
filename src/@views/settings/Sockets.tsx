import React, { Component } from 'react'
import { Container, Content, Text } from 'native-base'
import { CheckOrCross } from '@components/CheckOrCross'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TableItem } from '@components/TableItem'
import { sharedSync } from '@sync/Sync'

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
          <Row title={translate('connected')} ok={sharedSync.connected} />
          <Row title={translate('authorized')} ok={sharedSync.authorized} />
          {sharedSync.connectionError && (
            <TableItem>
              <Text {...sharedColors.textExtraStyle}>
                {translate('socketError')}
              </Text>
              <Text {...sharedColors.textExtraStyle}>
                {sharedSync.connectionError}
              </Text>
            </TableItem>
          )}
        </Content>
      </Container>
    )
  }
}
