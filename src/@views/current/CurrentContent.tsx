import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedTodoStore } from '@stores/TodoStore'
import { Button, Container, Text, View } from 'native-base'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { SegmentedProgressView } from '@components/SegmentedProgressView'
import { PlusButton } from '@components/PlusButton'
import { sharedTagStore } from '@stores/TagStore'
import { EpicProgress } from './EpicProgress'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { realm } from '@utils/realm'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { MelonTodo } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { makeObservable, observable } from 'mobx'
import { v4 } from 'uuid'
import { getTitle } from '@models/Todo'
import { SectionList } from 'react-native'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { IconButton } from '@components/IconButton'
import { database, todosCollection } from '@utils/wmdb'

export let currentTodoNodeId: number

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()

  todos = todosCollection.query(
    Q.where('is_completed', false),
    Q.where('is_deleted', false),
    Q.where('text', Q.notEq('')),
    Q.experimentalTake(1)
  )

  @observable loading = false

  state = { completedToday: 0 }

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    this.setState({
      completedToday: await todosCollection
        .query(Q.where('is_completed', true))
        .fetchCount(),
    })
    todosCollection
      .query(Q.where('is_completed', true))
      .observe()
      .subscribe((amount) => this.setState({ completedToday: amount.length }))
  }

  render() {
    return (
      <Container {...({ language: sharedSettingsStore.language } as any)}>
        <HeaderScrollView
          title={translate('current')}
          showsHeroButton
          infoTitle="infoCurrent"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {!!sharedTagStore.undeletedTags.filter((tag) => tag.epic).length && (
            <View style={{ marginTop: 16 }}>
              <DraggableFlatList
                data={sharedTagStore.undeletedTags
                  .filter((tag) => tag.epic)
                  .sort((a, b) => {
                    if ((a.epicOrder ?? 0) < (b.epicOrder ?? 0)) return -1
                    return 1
                  })}
                renderItem={({ item, index, drag, isActive }) => {
                  return <EpicProgress epic={item} key={index} drag={drag} />
                }}
                keyExtractor={(_, index) => `draggable-epic-${index}`}
                onDragEnd={(epics) => {
                  realm.write(() => {
                    epics.data.map((epic, index) => {
                      epic.epicOrder = index
                      epic.updatedAt = new Date()
                    })
                    sharedTagStore.refreshTags()
                    sharedSync.sync(SyncRequestEvent.Tag)
                  })
                }}
              />
            </View>
          )}
          {
            <SegmentedProgressView
              completed={sharedTodoStore.progress.completed}
              total={sharedTodoStore.progress.count}
            />
          }
          {!!sharedTodoStore.uncompletedTodayAmount && (
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                currentTodoNodeId = target
              }}
            >
              <EnhancedTodoCard todo={this.vm.currentTodo} />
            </View>
          )}
          {!!sharedTodoStore.progress.count &&
            sharedTodoStore.progress.count ===
              sharedTodoStore.progress.completed && <AllDonePlaceholder />}
          {!sharedTodoStore.progress.count && <NoTodosPlaceholder />}
        </HeaderScrollView>
        <PlusButton />
      </Container>
    )
  }
}

const enhance = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const EnhancedTodoCard = enhance(({ todo }: { todo: MelonTodo[] }) => {
  return <TodoCard todo={todo[0]} type={CardType.current} />
})
