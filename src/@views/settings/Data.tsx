import { Divider } from '@components/Divider'
import { SectionHeader } from '@components/SectionHeader'
import { TableItem } from '@components/TableItem'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { Q } from '@nozbe/watermelondb'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { alertError } from '@utils/alert'
import { gatherData } from '@utils/gatherData'
import { translate } from '@utils/i18n'
import { TagColumn, TodoColumn } from '@utils/melondb'
import * as rest from '@utils/rest'
import { sharedColors } from '@utils/sharedColors'
import { tagsCollection, todosCollection } from '@utils/wmdb'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import { Container, Content, Text, Toast } from 'native-base'
import React, { Component } from 'react'

@observer
class Row extends Component<{ title: string; subtitle: string }> {
  render() {
    return (
      <TableItem>
        <Text style={{ ...sharedColors.regularTextExtraStyle.style, flex: 1 }}>
          {this.props.title}
        </Text>
        <Text style={{ ...sharedColors.regularTextExtraStyle.style }}>
          {this.props.subtitle}
        </Text>
      </TableItem>
    )
  }
}

@observer
export class Data extends Component {
  @observable todosAmount = 0
  @observable tagsAmount = 0

  UNSAFE_componentWillMount() {
    makeObservable(this)
    todosCollection
      .query(Q.where(TodoColumn.deleted, false))
      .observeCount(false)
      .subscribe((amount) => (this.todosAmount = amount))
    tagsCollection
      .query(Q.where(TagColumn.deleted, false))
      .observeCount(false)
      .subscribe((amount) => (this.tagsAmount = amount))
  }

  render() {
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedColors.backgroundColor,
          }}
          contentContainerStyle={{
            paddingTop: 16,
          }}
        >
          {/* Count */}
          <SectionHeader title={translate('count')} />
          <Row
            title={translate('todoCount')}
            subtitle={`${this.todosAmount}`}
          />
          <Row title={translate('tagsCount')} subtitle={`${this.tagsAmount}`} />
          <Row
            title={translate('delegate.delegators')}
            subtitle={`${sharedDelegationStore.delegators.length}`}
          />
          <Row
            title={translate('delegate.delegates')}
            subtitle={`${sharedDelegationStore.delegates.length}`}
          />
          {/* Sync */}
          <Divider />
          <SectionHeader title={translate('sync')} />
          {/* TODO: put real data here */}
          {/* <Row
            title={translate('todosLastSync')}
            subtitle={`${
              sharedTodoStore.lastSyncDate
                ? moment(sharedTodoStore.lastSyncDate).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : translate('notSyncedYet')
            }`}
          /> */}
          {/* TODO: put real data here */}
          {/* <Row
            title={translate('tags')}
            subtitle={`${
              sharedTagStore.lastSyncDate
                ? moment(sharedTagStore.lastSyncDate).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : translate('notSyncedYet')
            }`}
          /> */}
          <Row
            title={translate('settingsLastSync')}
            subtitle={`${
              sharedSettingsStore.updatedAt
                ? moment(sharedSettingsStore.updatedAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : translate('notSyncedYet')
            }`}
          />
          <Row
            title={translate('accountLastSync')}
            subtitle={`${
              sharedSessionStore.user?.updatedAt
                ? moment(sharedSessionStore.user.updatedAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : translate('notSyncedYet')
            }`}
          />
          <Row
            title={translate('gamification')}
            subtitle={`${
              sharedHeroStore.updatedAt
                ? moment(sharedHeroStore.updatedAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : translate('notSyncedYet')
            }`}
          />
          {/* Actions */}
          <Divider />
          <TableItem
            onPress={async () => {
              try {
                await sharedSync.sync(SyncRequestEvent.All)
              } catch (err) {
                alertError(err)
              }
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('syncData')}
            </Text>
          </TableItem>
          <TableItem
            onPress={async () => {
              try {
                await sharedSync.hardSync()
              } catch (err) {
                alertError(err)
              }
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('syncDataHard')}
            </Text>
          </TableItem>
          <TableItem
            onPress={() => {
              sharedTodoStore.recalculateExactDates()
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('syncExactDates')}
            </Text>
          </TableItem>
          <TableItem
            onPress={async () => {
              const data = await gatherData()
              await rest.sendData(data)
              Toast.show({
                text: '👍',
              })
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('sendDataToServer')}
            </Text>
          </TableItem>
        </Content>
      </Container>
    )
  }
}
