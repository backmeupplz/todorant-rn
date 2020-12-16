import React, { Component, PureComponent } from 'react'
import { Button, Container, Text, View, Spinner, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableSectionList from '@upacyxou/react-native-draggable-sectionlist'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { PlanningVM } from '@views/planning/PlanningVM'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlusButton } from '@components/PlusButton'
import { PlanningDateHeader } from './PlanningDateHeader'
import { SectionList, StyleSheet, TouchableOpacity } from 'react-native'
import uuid from 'uuid'
import { Month } from '@upacyxou/react-native-month'
import { observable } from 'mobx'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import moment from 'moment'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { alertConfirm, alertMessage } from '@utils/alert'
import { getDateMonthAndYearString } from '@utils/time'

@observer
export class PlanningContent extends Component {
  vm = new PlanningVM()

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {sharedTodoStore.isPlanningRequired &&
          sharedAppStateStore.todoSection !== TodoSectionType.completed && (
            <Text
              style={{
                backgroundColor: 'dodgerblue',
                color: 'white',
                padding: 12,
              }}
            >
              {translate('planningText')}
            </Text>
          )}
        {sharedAppStateStore.todoSection !== TodoSectionType.completed ? (
          this.vm.uncompletedTodosArray.length ? (
            <DraggableSectionListWithLoader
              onViewableItemsChanged={() => {
                sharedAppStateStore.changeLoading(false)
              }}
              contentContainerStyle={{ paddingBottom: 100 }}
              autoscrollSpeed={200}
              data={
                sharedAppStateStore.hash.length ||
                sharedAppStateStore.searchQuery[0]
                  ? this.vm.allTodosAndHash
                  : this.vm.uncompletedTodosArray
              }
              layoutInvalidationKey={this.vm.theoreticalKey}
              keyExtractor={(item, index) => {
                return `${index}-${item._tempSyncId || item}`
              }}
              onDragEnd={this.vm.onDragEnd}
              isSectionHeader={(a: any) => {
                if (a === undefined) {
                  return false
                }
                return !a.text
              }}
              renderItem={({ item, index, drag, isActive }) => {
                if (!item.item) return
                return (
                  <View style={{ padding: isActive ? 10 : 0 }} key={index}>
                    <TodoCard
                      todo={item.item}
                      type={
                        sharedAppStateStore.todoSection ===
                        TodoSectionType.planning
                          ? CardType.planning
                          : CardType.done
                      }
                      drag={drag}
                      active={isActive}
                    />
                  </View>
                )
              }}
              renderSectionHeader={({ item, drag, index, isActive }) => {
                return (
                  <PlanningDateHeader
                    drag={drag}
                    isActive={isActive}
                    item={item}
                    key={index}
                    vm={this.vm}
                  />
                )
              }}
            />
          ) : (
            <NoTodosPlaceholder />
          )
        ) : (
          <SectionListWithLoader
            onViewableItemsChanged={() => {
              sharedAppStateStore.changeLoading(false)
            }}
            refreshing={true}
            initialNumToRender={10}
            keyExtractor={(item, index) => {
              return `${index}-${item._tempSyncId || item}`
            }}
            sections={this.vm.completedTodosArray}
            renderItem={({ item }) => (
              <TodoCard
                todo={item}
                type={
                  sharedAppStateStore.todoSection === TodoSectionType.planning
                    ? CardType.planning
                    : CardType.done
                }
              />
            )}
            renderSectionHeader={({ section }) => (
              <PlanningDateHeader item={section} vm={this.vm} />
            )}
          />
        )}
        <PlusButton />
      </Container>
    )
  }
}
class DraggableSectionListWithLoader<T> extends DraggableSectionList<T> {
  componentWillUpdate() {
    sharedAppStateStore.changeLoading(false)
  }
  componentDidMount() {
    sharedAppStateStore.changeLoading(false)
  }
}

class SectionListWithLoader extends SectionList {
  componentDidMount() {
    sharedAppStateStore.changeLoading(false)
  }
  componentWillUpdate() {
    sharedAppStateStore.changeLoading(false)
  }
}

let styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: sharedColors.primaryColor,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})
