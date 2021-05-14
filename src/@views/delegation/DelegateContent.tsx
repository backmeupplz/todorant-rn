import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Container, Text, View } from 'native-base'
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
import { sharedColors } from '@utils/sharedColors'
import { makeObservable, observable } from 'mobx'
import { SectionList, SectionListData } from 'react-native'
import { TodoHeader } from '@components/TodoHeader'
import { Todo } from '@models/Todo'

@observer
export class DelegateContent extends Component {
  renderDelegationSectionList(byMe: boolean, completed = false) {
    let todosMapToRender: SectionListData<Todo>[]
    if (byMe && completed) {
      todosMapToRender = sharedTodoStore.delegatedByMeCompletedTodosMap
    } else if (byMe) {
      todosMapToRender = sharedTodoStore.delegatedByMeTodosMap
    } else {
      todosMapToRender = sharedTodoStore.delegatedToMeTodosMap
    }

    return (
      <SectionList
        renderItem={({ item, index }) => {
          return <TodoCard key={index} todo={item} type={CardType.delegation} />
        }}
        renderSectionHeader={(header) => {
          return (
            <TodoHeader
              item={header.section.userInSection.name}
              hidePlus={true}
            />
          )
        }}
        sections={todosMapToRender}
        keyExtractor={(item) => (item._id || item._tempSyncId) as string}
      />
    )
  }

  renderDelegation() {
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe) {
      return (
        <>
          {!sharedTodoStore?.delegatedToMeTodosMap?.length && (
            <NoDelegatedTasks />
          )}
          {!!sharedTodoStore?.delegatedToMeTodosMap?.length &&
            this.renderDelegationSectionList(false)}
        </>
      )
    }
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ByMe) {
      return (
        <>
          {!sharedTodoStore?.delegatedByMeTodosMap?.length && (
            <NoDelegatedTasks />
          )}
          {!!sharedTodoStore?.delegatedByMeTodosMap?.length &&
            this.renderDelegationSectionList(true)}
        </>
      )
    }
    if (
      sharedDelegateStateStore.todoSection === DelegateSectionType.Completed
    ) {
      return (
        <>
          {!sharedTodoStore?.delegatedByMeCompleted?.length && (
            <NoDelegatedTasks />
          )}
          {!!sharedTodoStore?.delegatedByMeCompleted?.length &&
            this.renderDelegationSectionList(true, true)}
        </>
      )
    }
  }

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {!sharedSessionStore.user && <SignupPlaceholder />}
        {!!sharedSessionStore.user && this.renderDelegation()}
      </Container>
    )
  }
}
