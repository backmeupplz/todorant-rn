import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import moment from 'moment'
import { sockets } from '@utils/sockets'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { realm } from '@utils/realm'
import { Todo } from '@models/Todo'

class Row extends Component<{ title: string; subtitle: string }> {
  render() {
    return (
      <ListItem style={{ justifyContent: 'space-between' }}>
        <Text>{this.props.title}</Text>
        <Text>{this.props.subtitle}</Text>
      </ListItem>
    )
  }
}

@observer
export class Data extends Component {
  render() {
    return (
      <Container>
        <Content>
          <List>
            <Row
              title="Todos count"
              subtitle={`${
                realm.objects<Todo>(Todo).filtered('deleted = false').length
              }`}
            />
            <Row
              title="Todos last synced"
              subtitle={`${
                sharedTodoStore.lastSyncDate
                  ? moment(sharedTodoStore.lastSyncDate).format(
                      'YYYY-MM-DD hh:mm:ss'
                    )
                  : 'Not synced yet'
              }`}
            />
            <Row
              title="Settings last synced"
              subtitle={`${
                sharedSettingsStore.updatedAt
                  ? moment(sharedSettingsStore.updatedAt).format(
                      'YYYY-MM-DD hh:mm:ss'
                    )
                  : 'Not synced yet'
              }`}
            />
            <ListItem
              button
              onPress={() => {
                sockets.globalSync()
              }}
            >
              <Text>Sync data</Text>
            </ListItem>
          </List>
        </Content>
      </Container>
    )
  }
}
