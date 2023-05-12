import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { CardType } from '@components/TodoCard/CardType'
import { Container, View } from 'native-base'
import { EpicProgress } from '@views/current/EpicProgress'
import { Fragment, memo, useEffect, useState } from 'react'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo } from '@models/MelonTodo'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { Observer } from 'mobx-react'
import { PlusButton } from '@components/PlusButton'
import { SegmentedProgressView } from '@components/SegmentedProgressView'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TodoCard } from '@components/TodoCard'
import { database } from '@utils/watermelondb/wmdb'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { translate } from '@utils/i18n'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import React from 'react'
import withObservables from '@nozbe/with-observables'

export let currentTodoNodeId: number

export const CurrentContent = memo(() => {
  const [epicsAmount, setEpicAmount] = useState(0)

  useEffect(() => {
    sharedTagStore.epics
      .observeCount(false)
      .subscribe((amount) => setEpicAmount(amount))
  }, [])

  return (
    <Observer>
      {() => (
        <Container {...({ language: sharedSettingsStore.language } as any)}>
          <HeaderScrollView
            title={translate('current')}
            showsHeroButton
            infoTitle="infoCurrent"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {!!epicsAmount && <EnhancedEpics epics={sharedTagStore.epics} />}
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
                <EnhancedTodoCard
                  todo={sharedTodoStore.todayUncompletedTodos}
                />
              </View>
            )}
            {!!sharedTodoStore.progress.count &&
              sharedTodoStore.progress.count ===
                sharedTodoStore.progress.completed && <AllDonePlaceholder />}
            {!sharedTodoStore.progress.count && <NoTodosPlaceholder />}
          </HeaderScrollView>
          <PlusButton />
        </Container>
      )}
    </Observer>
  )
})

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
        renderItem={({ item, drag }) => {
          return (
            <ScaleDecorator>
              <EpicProgress epic={item} key={item._tempSyncId} drag={drag} />
            </ScaleDecorator>
          )
        }}
        keyExtractor={(epic) => epic._tempSyncId}
        onDragEnd={async (epics) => {
          const toUpdate = epics.data.map((epic, index) => {
            return epic.prepareUpdateWithDescription(
              (epicToUpdate) => (epicToUpdate.epicOrder = index),
              'changing epic order'
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
  return todo[0] ? (
    <Fragment key={todo[0]._tempSyncId}>
      <TodoCard todo={todo[0]} type={CardType.current} />
    </Fragment>
  ) : null
})
