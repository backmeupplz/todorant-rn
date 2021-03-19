import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedTodoStore } from '@stores/TodoStore'
import { Container, View } from 'native-base'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { SegmentedProgressView } from '@components/SegmentedProgressView'
import { PlusButton } from '@components/PlusButton'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedTagStore } from '@stores/TagStore'
import { EpicProgress } from './EpicProgress'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { realm } from '@utils/realm'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'

export let currentTodoNodeId: number

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()

  render() {
    // Hack to make this reactive
    let languageTag = sharedAppStateStore.languageTag
    languageTag = `${languageTag}`

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
          {!!sharedTodoStore.progress.count && (
            <SegmentedProgressView
              completed={sharedTodoStore.progress.completed}
              total={sharedTodoStore.progress.count}
            />
          )}
          {!!this.vm.currentTodo && (
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                currentTodoNodeId = target
              }}
            >
              <TodoCard todo={this.vm.currentTodo} type={CardType.current} />
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
