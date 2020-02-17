import React, { Component } from 'react'
import { Container, Content, List, ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import moment from 'moment'

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
              subtitle={`${sharedTodoStore.todos.length}`}
            />
            <Row
              title="Last synced"
              subtitle={`${
                sharedTodoStore.lastSyncDate
                  ? moment(sharedTodoStore.lastSyncDate).format(
                      'YYYY-MM-DD hh:mm:ss'
                    )
                  : 'Not synced yet'
              }`}
            />
          </List>
        </Content>
      </Container>
    )
  }
}
