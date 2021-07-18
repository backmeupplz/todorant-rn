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
import { Todo } from '@models/Todo'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { Query } from '@nozbe/watermelondb'

const enhance = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const EnhancedDraggableSectionList = enhance(
  ({
    todo,
    completed,
    byMe,
  }: {
    todo: MelonTodo[]
    completed: boolean
    byMe: boolean
  }) => {
    const [ready, setReady] = useState(false)
    const [map, setMap] = useState<
      {
        userInSection: MelonUser
        data: MelonTodo[]
      }[]
    >()
    const [completedCopy, setCompleted] = useState<boolean>()
    const [byMeCopy, setByMe] = useState<boolean>()
    const [length, setLength] = useState(0)

    async function build() {
      const todoSectionMap = {} as {
        [key: string]: { userInSection: MelonUser; data: MelonTodo[] }
      }
      let currentTitle: string | undefined
      let sectionIndex = 0
      for (const realmTodo of todo) {
        const user = await (byMe ? realmTodo.user : realmTodo.delegator)
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

    if (
      !(completed === completedCopy && byMeCopy === byMe) ||
      length !== todo.length
    ) {
      build()
      setCompleted(completed)
      setByMe(byMe)
      setLength(todo.length)
    }

    return ready && map ? (
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
    let todosMapToRender: Query<MelonTodo> | undefined
    if (byMe && completed) {
      todosMapToRender = sharedTodoStore.delegatedByMeCompleted
    } else if (byMe) {
      todosMapToRender = sharedTodoStore.delegatedByMe
    } else {
      todosMapToRender = sharedTodoStore.delegatedToMe
    }

    return (
      <EnhancedDraggableSectionList
        todo={todosMapToRender}
        byMe={byMe}
        completed={completed}
      />
    )
  }

  renderDelegation() {
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe) {
      return (
        <>
          {!sharedTodoStore?.delegatedToMeCount && <NoDelegatedTasks />}
          {!!sharedTodoStore?.delegatedToMeCount &&
            this.renderDelegationSectionList(false)}
        </>
      )
    }
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ByMe) {
      return (
        <>
          {!sharedTodoStore?.delegatedByMeCount && <NoDelegatedTasks />}
          {!!sharedTodoStore?.delegatedByMeCount &&
            this.renderDelegationSectionList(true)}
        </>
      )
    }
    if (
      sharedDelegateStateStore.todoSection === DelegateSectionType.Completed
    ) {
      return (
        <>
          {!sharedTodoStore?.delegatedByMeCompletedCount && (
            <NoDelegatedTasks />
          )}
          {!!sharedTodoStore?.delegatedByMeCompletedCount &&
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
