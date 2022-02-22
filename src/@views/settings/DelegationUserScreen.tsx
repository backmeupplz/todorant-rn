import { Container, Content, Text } from 'native-base'
import { DelegationUserType } from '@models/DelegationUser'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Q, Query } from '@nozbe/watermelondb'
import React, { Component, Fragment } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { alertConfirm, alertError } from '@utils/alert'
import { makeObservable, observable } from 'mobx'

import { IconButton } from '@components/IconButton'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { UserColumn } from '@utils/watermelondb/tables'
import { observer } from 'mobx-react'
import { removeDelegation } from '@utils/delegations'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { translate } from '@utils/i18n'
import { usersCollection } from '@utils/watermelondb/wmdb'
import withObservables from '@nozbe/with-observables'

@observer
class Row extends Component<{
  delegationUser: MelonUser
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
                  await this.props.delegationUser.delete()
                  await sharedSync.sync()
                } catch (err) {
                  alertError(err as string)
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
  @observable list?: Query<MelonUser>

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    this.list =
      this.props.route.params.delegationType === DelegationUserType.delegate
        ? usersCollection.query(
            Q.where(UserColumn.isDelegator, false),
            Q.where(UserColumn.deleted, Q.notEq(true)),
            Q.where(
              UserColumn._id,
              Q.notEq(sharedSessionStore.user?._id || null)
            )
          )
        : usersCollection.query(
            Q.where(UserColumn.isDelegator, true),
            Q.where(UserColumn.deleted, Q.notEq(true)),
            Q.where(
              UserColumn._id,
              Q.notEq(sharedSessionStore.user?._id || null)
            )
          )
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
          {!!this.list && this.list ? (
            <EnhancedList
              list={this.list}
              type={this.props.route.params.delegationType}
            />
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
  const route =
    useRoute<
      RouteProp<Record<string, { delegationType: DelegationUserType }>, string>
    >()
  return <DelegationUserScreenContent route={route} />
}

const enhance = withObservables(['list'], (items) => {
  return {
    list: items.list,
  }
})

const EnhancedList = enhance(
  ({ list, type }: { list: MelonUser[]; type: DelegationUserType }) => (
    <>
      {list.length ? (
        list.map((u, i) => (
          <Row key={i} delegationUser={u} delegationType={type} />
        ))
      ) : (
        <TableItem>
          <Text {...sharedColors.textExtraStyle}>
            {translate(
              type === DelegationUserType.delegate
                ? 'delegate.noDelegates'
                : 'delegate.noDelegators'
            )}
          </Text>
        </TableItem>
      )}
    </>
  )
)
