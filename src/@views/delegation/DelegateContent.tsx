import React, { Component, Fragment, useState } from 'react'
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
import { getTitle, Todo } from '@models/Todo'
import withObservables from '@nozbe/with-observables'
import { MelonTodo, MelonUser } from '@models/MelonTodo'

const enhance = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const EnhancedDraggableSectionList = enhance(
  ({ todo }: { todo: MelonTodo[] }) => {
    const [ready, setReady] = useState(false)
    const [map, setMap] = useState()

    async function build() {
      const todoSectionMap = {} as any
      let currentTitle: string | undefined
      let sectionIndex = 0
      for (const realmTodo of todo) {
        const user = await realmTodo.delegator
        if (!user) continue
        const titleKey = user?._id
        if (!titleKey) continue
        if (currentTitle && currentTitle !== titleKey) {
          sectionIndex++
        }
        if (todoSectionMap[titleKey]) {
          todoSectionMap[titleKey].data.push(realmTodo)
        } else {
          todoSectionMap[titleKey] = {
            userInSection: user,
            data: [realmTodo],
          }
        }
      }

      const todosMap = Object.keys(todoSectionMap).map((key) => {
        return todoSectionMap[key]
      })
      setMap(todosMap)
      setReady(true)
    }

    if (!ready) build()

    return ready ? (
      <SectionList
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        initialNumToRender={10}
        updateCellsBatchingPeriod={1}
        sections={map}
        renderItem={({ item, index }) => {
          return (
            <Fragment key={item.id}>
              <TodoCard todo={item} type={CardType.delegation} />
            </Fragment>
          )
        }}
        renderSectionHeader={(header) => {
          return (
            <TodoHeader
              item={header.section.userInSection.name}
              hidePlus={true}
            />
          )
        }}
      />
    ) : null
  }
)

@observer
export class DelegateContent extends Component {
  renderDelegationSectionList(byMe: boolean, completed = false) {
    let todosMapToRender: SectionListData<Todo>[]
    if (true) {
      todosMapToRender = sharedTodoStore.delegatedToMeTodo
    } else if (byMe) {
      todosMapToRender = sharedTodoStore.delegatedByMeTodosMap
    } else {
      todosMapToRender = sharedTodoStore.delegatedToMeTodosMap
    }

    return (
      <EnhancedDraggableSectionList todo={sharedTodoStore.delegatedToMeTodo} />
    )
  }

  renderDelegation() {
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe) {
      return (
        <>
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
        {this.renderDelegationSectionList(false)}
      </Container>
    )
  }
}
