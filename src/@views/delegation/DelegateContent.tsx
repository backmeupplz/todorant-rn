import React, { Component, Fragment, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { Container } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { SignupPlaceholder } from '@views/delegation/SignupPlaceholder'
import { NoDelegatedTasks } from '@views/delegation/NoDelegatedTasks'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import {
  sharedDelegateStateStore,
  DelegateSectionType,
} from '@stores/DelegateScreenStateStore'
import { sharedColors } from '@utils/sharedColors'
import { SectionList } from 'react-native'
import { TodoHeader } from '@components/TodoHeader'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { Query } from '@nozbe/watermelondb'
import { usersCollection } from '@utils/watermelondb/wmdb'

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
    const [map, setMap] = useState<
      {
        userInSection: MelonUser
        data: MelonTodo[]
      }[]
    >([])

    async function build() {
      const todoSectionMap = {} as {
        [key: string]: { userInSection: MelonUser; data: MelonTodo[] }
      }
      for (const realmTodo of todo) {
        try {
          const user = await (byMe && !completed
            ? realmTodo.user
            : realmTodo.delegator)
          if (!user) continue
          const titleKey = user?._id
          if (!titleKey) continue
          if (todoSectionMap[titleKey]) {
            todoSectionMap[titleKey].data.push(realmTodo)
          } else {
            todoSectionMap[titleKey] = {
              userInSection: user,
              data: [realmTodo],
            }
          }
        } catch (e) {
          // Do nothing
        }
      }

      const todosMap = Object.keys(todoSectionMap).map((key) => {
        return todoSectionMap[key]
      })
      setMap(todosMap)
    }

    useEffect(() => {
      build()
    }, [completed, todo.length, byMe])

    return (
      <SectionList
        ListEmptyComponent={<NoDelegatedTasks />}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        initialNumToRender={10}
        updateCellsBatchingPeriod={1}
        sections={map}
        renderItem={({ item }) => {
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
    )
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
      return <>{this.renderDelegationSectionList(false)}</>
    }
    if (sharedDelegateStateStore.todoSection === DelegateSectionType.ByMe) {
      return <>{this.renderDelegationSectionList(true)}</>
    }
    return <>{this.renderDelegationSectionList(true, true)}</>
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
