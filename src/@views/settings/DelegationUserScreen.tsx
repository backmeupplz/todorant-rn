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
import { makeObservable, observable } from 'mobx'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { removeDelegation } from '@utils/delegations'
import { realm } from '@utils/realm'
import { usersCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { UserColumn } from '@utils/melondb'

@observer
class Row extends Component<{
  delegationUser: DelegationUser
  delegationType: string
}> {
  @observable loading = false

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <TableItem>
        <Text style={{ maxWidth: '90%', ...sharedColors.textExtraStyle.style }}>
          {this.props.delegationUser.name}
        </Text>
        <IconButton
          disabled={this.loading}
          onPress={() => {
            alertConfirm(
              translate('delegate.deleteDelegatorConfirmation'),
              translate('delete'),
              async () => {
                this.loading = true
                try {
                  if (
                    this.props.delegationType === DelegationUserType.delegate
                  ) {
                    realm.write(() => {
                      removeDelegation(this.props.delegationUser, false)
                    })
                  } else {
                    realm.write(() => {
                      removeDelegation(this.props.delegationUser, true)
                    })
                  }
                  sharedSync.sync(SyncRequestEvent.Delegation)
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
  @observable list: any

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    this.list = await (this.props.route.params.delegationType ===
    DelegationUserType.delegate
      ? usersCollection.query(Q.where(UserColumn.isDelegator, false))
      : usersCollection.query(Q.where(UserColumn.isDelegator, true))
    ).fetch()
  }

  render() {
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedColors.backgroundColor,
            paddingTop: 16,
          }}
        >
          {!!this.list && this.list.length ? (
            this.list.map((u, i) => (
              <Row
                key={i}
                delegationUser={u}
                delegationType={this.props.route.params.delegationType}
              />
            ))
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
