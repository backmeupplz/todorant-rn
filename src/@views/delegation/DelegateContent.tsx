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
import { SectionList } from 'react-native'
import { TodoHeader } from '@components/TodoHeader'

@observer
export class DelegateContent extends Component {
  constructor(props: any) {
    super(props)
    makeObservable(this)
  }

  renderDelegationSectionList(byMe: boolean) {
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
        sections={
          byMe
            ? sharedTodoStore.delegatedByMeTodosMap
            : sharedTodoStore.delegatedToMeTodosMap
        }
        keyExtractor={(item) => (item._id || item._tempSyncId) as string}
      />
    )
  }

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {!sharedSessionStore.user && <SignupPlaceholder />}
        {!!sharedSessionStore.user &&
          (sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe ? (
            <>
              {!sharedTodoStore?.delegatedToMeTodosMap?.length && (
                <NoDelegatedTasks />
              )}
              {!!sharedTodoStore?.delegatedToMeTodosMap?.length &&
                this.renderDelegationSectionList(false)}
            </>
          ) : (
            <>
              {!sharedTodoStore?.delegatedByMeTodosMap?.length && (
                <NoDelegatedTasks />
              )}
              {!!sharedTodoStore?.delegatedByMeTodosMap?.length &&
                this.renderDelegationSectionList(true)}
            </>
          ))}
      </Container>
    )
  }
}
