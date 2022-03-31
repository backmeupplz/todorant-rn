import * as rest from '@utils/rest'
import { Container, Content, Text, Toast } from 'native-base'
import { Divider } from '@components/Divider'
import { MelonTag, cloneTag } from '@models/MelonTag'
import { MelonTodo } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { SectionHeader } from '@components/SectionHeader'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { TagColumn } from '@utils/watermelondb/tables'
import { alertError } from '@utils/alert'
import { cloneTodo } from '@models/Todo'
import { database, tagsCollection } from '@utils/watermelondb/wmdb'
import { gatherData } from '@utils/gatherData'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'
import moment from 'moment'

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
    sharedTodoStore.undeletedTodos
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
            subtitle={`${sharedDelegationStore.delegatorsCount}`}
          />
          <Row
            title={translate('delegate.delegates')}
            subtitle={`${sharedDelegationStore.delegatesCount}`}
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
                alertError(err as string)
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
                alertError(err as string)
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
              if (!sharedSessionStore.user?.token) {
                return
              }
              const data = await gatherData()
              const clonedTodos = await Promise.all(data.todos.map(cloneTodo))
              const clonedTags = await Promise.all(data.tags.map(cloneTag))
              try {
                await rest.sendData(
                  { tags: clonedTags, todos: clonedTodos },
                  sharedSessionStore.user?.token
                )
              } catch (err) {
                alertError(err as string)
              }
              const todosAndTags = [...data.todos, ...data.tags]
              const toSend = [] as (MelonTodo | MelonTag)[]
              todosAndTags.map((todoOrTag) => {
                toSend.push(
                  todoOrTag.prepareUpdateWithDescription((todoOrTagUpdate) => {
                    todoOrTagUpdate.updatedAt = new Date()
                  }, 'updating updated at while sendind todos and tags on server')
                )
              })

              await database.write(async () => await database.batch(...toSend))
              await sharedSync.globalSync()
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
