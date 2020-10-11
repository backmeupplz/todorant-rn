import React, { Component } from 'react'
import { Container, Content, Text } from 'native-base'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TableItem } from '@components/TableItem'
import { RouteProp, useRoute } from '@react-navigation/native'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { IconButton } from '@components/IconButton'
import { alertConfirm, alertError } from '@utils/alert'
import { observable } from 'mobx'
import { deleteDelegate, deleteDelegator } from '@utils/rest'
import { sockets } from '@utils/sockets'

@observer
class Row extends Component<{ delegationUser: DelegationUser }> {
  @observable loading = false
  render() {
    return (
      <TableItem>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.delegationUser.name}
        </Text>
        <IconButton
          disabled={this.loading}
          onPress={() => {
            alertConfirm(
              this.props.delegationUser.delegationType ===
                DelegationUserType.delegate
                ? translate('delegate.deleteDelegateConfirmation')
                : translate('delegate.deleteDelegatorConfirmation'),
              translate('delete'),
              async () => {
                this.loading = true
                try {
                  if (
                    this.props.delegationUser.delegationType ===
                    DelegationUserType.delegate
                  ) {
                    await deleteDelegate(this.props.delegationUser._id)
                  } else {
                    await deleteDelegator(this.props.delegationUser._id)
                  }
                  sockets.delegationSyncManager.sync()
                } catch (err) {
                  alertError(err)
                } finally {
                  this.loading = false
                }
              },
              this.props.delegationUser.name
            )
          }}
          color={sharedColors.destructIconColor}
          name="delete_outline_28-iOS"
        />
      </TableItem>
    )
  }
}

@observer
export class DelegationUserScreenContent extends Component<{
  route: RouteProp<
    Record<
      string,
      {
        delegationType: DelegationUserType
      }
    >,
    string
  >
}> {
  render() {
    const list =
      this.props.route.params.delegationType === DelegationUserType.delegate
        ? sharedDelegationStore.delegates
        : sharedDelegationStore.delegators
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedColors.backgroundColor,
            paddingTop: 16,
          }}
        >
          {list.length ? (
            list.map((u) => <Row delegationUser={u} />)
          ) : (
            <TableItem>
              <Text {...sharedColors.textExtraStyle}>
                {translate(
                  this.props.route.params.delegationType ===
                    DelegationUserType.delegate
                    ? 'delegate.noDelegates'
                    : 'delegate.noDelegators'
                )}
              </Text>
            </TableItem>
          )}
        </Content>
      </Container>
    )
  }
}

export const DelegationUserScreen = () => {
  const route = useRoute<
    RouteProp<Record<string, { delegationType: DelegationUserType }>, string>
  >()
  return <DelegationUserScreenContent route={route} />
}