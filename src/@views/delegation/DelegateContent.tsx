import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Container } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { SignupPlaceholder } from '@views/delegation/SignupPlaceholder'
import { NoDelegatedTasks } from '@views/delegation/NoDelegatedTasks'
import { sharedTodoStore } from '@stores/TodoStore'
import { FlatList } from 'react-native-gesture-handler'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import {
  sharedDelegateStateStore,
  DelegateSectionType,
} from '@stores/DelegateScreenStateStore'

@observer
export class DelegateContent extends Component {
  render() {
    return (
      <Container>
        {!sharedSessionStore.user && <SignupPlaceholder />}
        {!!sharedSessionStore.user &&
          (sharedDelegateStateStore.todoSection === DelegateSectionType.toMe ? (
            <>
              {!sharedTodoStore.unacceptedTodos.length && <NoDelegatedTasks />}
              {!!sharedTodoStore.unacceptedTodos.length && (
                <FlatList
                  data={sharedTodoStore.unacceptedTodos}
                  style={{ marginTop: 20 }}
                  renderItem={({ item, index }) => {
                    return (
                      <TodoCard
                        key={index}
                        todo={item}
                        type={CardType.delegation}
                      />
                    )
                  }}
                />
              )}
            </>
          ) : (
            <>
              {!sharedTodoStore.delegatedTodos.length && <NoDelegatedTasks />}
              {!!sharedTodoStore.delegatedTodos.length && (
                <FlatList
                  data={sharedTodoStore.delegatedTodos}
                  style={{ marginTop: 20 }}
                  renderItem={({ item, index }) => {
                    return (
                      <TodoCard
                        key={index}
                        todo={item}
                        type={CardType.delegation}
                      />
                    )
                  }}
                />
              )}
            </>
          ))}
      </Container>
    )
  }
}
