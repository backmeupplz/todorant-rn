import React, { Component, Fragment } from 'react'
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
import { usersCollection } from '@utils/wmdb'
import { Q, Query } from '@nozbe/watermelondb'
import { UserColumn } from '@utils/melondb'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { sharedSessionStore } from '@stores/SessionStore'

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
                  if (
                    this.props.delegationType === DelegationUserType.delegate
                  ) {
                    await removeDelegation(
                      this.props.delegationUser,
                      false,
                      true
                    )
                  } else {
                    await removeDelegation(
                      this.props.delegationUser,
                      true,
                      true
                    )
                  }
                  await sharedSync.sync(SyncRequestEvent.Delegation)
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
    <Fragment>
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
    </Fragment>
  )
)
