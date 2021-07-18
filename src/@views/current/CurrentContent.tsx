import { observer } from 'mobx-react'
import React, { Component, Fragment } from 'react'
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
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { MelonTodo } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { makeObservable, observable } from 'mobx'
import { database } from '@utils/wmdb'
import { MelonTag } from '@models/MelonTag'

export let currentTodoNodeId: number

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()

  @observable loading = false

  @observable epicsAmount = 0

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    sharedTagStore.epics
      .observeCount(false)
      .subscribe((amount) => (this.epicsAmount = amount))
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
          {!!this.epicsAmount && <EnhancedEpics epics={sharedTagStore.epics} />}
          {!!sharedTodoStore.progress.count && (
            <SegmentedProgressView
              completed={sharedTodoStore.progress.completed}
              total={sharedTodoStore.progress.count}
            />
          )}
          {!!sharedTodoStore.uncompletedTodayAmount && (
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                currentTodoNodeId = target
              }}
            >
              <EnhancedTodoCard todo={sharedTodoStore.todayUncompletedTodos} />
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

const enhanceTodoCard = withObservables(['todo'], ({ todo }) => {
  return {
    todo: todo.observeWithColumns(
      Object.keys(todo.collection.database.schema.tables.todos.columns)
    ),
  }
})

const enhanceEpics = withObservables(['epics'], ({ epics }) => {
  return {
    epics: epics.observeWithColumns(
      Object.keys(epics.collection.database.schema.tables.tags.columns)
    ),
  }
})

const EnhancedEpics = enhanceEpics(({ epics }: { epics: MelonTag[] }) => {
  return (
    <View style={{ marginTop: 16 }}>
      <DraggableFlatList
        data={epics}
        renderItem={({ item, index, drag, isActive }) => {
          return <EpicProgress epic={item} key={item._tempSyncId} drag={drag} />
        }}
        keyExtractor={(epic) => epic._tempSyncId}
        onDragEnd={async (epics) => {
          const toUpdate = epics.data.map((epic, index) => {
            return epic.prepareUpdate(
              (epicToUpdate) => (epicToUpdate.epicOrder = index)
            )
          })
          await database.write(async () => await database.batch(...toUpdate))
          await sharedTagStore.refreshTags()
          sharedSync.sync(SyncRequestEvent.Tag)
        }}
      />
    </View>
  )
})

const EnhancedTodoCard = enhanceTodoCard(({ todo }: { todo: MelonTodo[] }) => {
  return (
    <Fragment key={todo[0]._tempSyncId}>
      <TodoCard todo={todo[0]} type={CardType.current} />
    </Fragment>
  )
})
