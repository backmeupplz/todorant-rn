import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedTagStore } from '@stores/TagStore'
import moment from 'moment'
import { sockets } from '@utils/sockets'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { realm } from '@utils/realm'
import { Todo } from '@models/Todo'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Tag } from '@models/Tag'
import { sharedHeroStore } from '@stores/HeroStore'

@observer
class Row extends Component<{ title: string; subtitle: string }> {
  render() {
    return (
      <ListItem>
        <Text style={{ ...sharedColors.textExtraStyle.style, flex: 1 }}>
          {this.props.title}
        </Text>
        <Text style={{ ...sharedColors.textExtraStyle.style }}>
          {this.props.subtitle}
        </Text>
      </ListItem>
    )
  }
}

@observer
export class Data extends Component {
  render() {
    return (
      <Container>
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          <List>
            <ListItem itemHeader>
              <Text {...sharedColors.textExtraStyle}>{translate('count')}</Text>
            </ListItem>
            <Row
              title={translate('todoCount')}
              subtitle={`${
                realm.objects<Todo>(Todo).filtered('deleted = false').length
              }`}
            />
            <Row
              title={translate('tagsCount')}
              subtitle={`${
                realm.objects<Tag>(Tag).filtered('deleted = false').length
              }`}
            />
            <ListItem itemHeader>
              <Text {...sharedColors.textExtraStyle}>{translate('sync')}</Text>
            </ListItem>
            <Row
              title={translate('todosLastSync')}
              subtitle={`${
                sharedTodoStore.lastSyncDate
                  ? moment(sharedTodoStore.lastSyncDate).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  : translate('notSyncedYet')
              }`}
            />
            <Row
              title={translate('tags')}
              subtitle={`${
                sharedTagStore.lastSyncDate
                  ? moment(sharedTagStore.lastSyncDate).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  : translate('notSyncedYet')
              }`}
            />
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
            <ListItem
              button
              onPress={() => {
                sockets.globalSync()
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('syncData')}
              </Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                sockets.hardSync()
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('syncDataHard')}
              </Text>
            </ListItem>
            <ListItem
              button
              onPress={() => {
                sharedTodoStore.recalculateExactDates()
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('syncExactDates')}
              </Text>
            </ListItem>
          </List>
        </Content>
      </Container>
    )
  }
}
