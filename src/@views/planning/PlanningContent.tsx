import React, { Component, PureComponent } from 'react'
import { Button, Container, Text, View, Spinner } from 'native-base'
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
import { SectionList } from 'react-native'
import uuid from 'uuid'

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
            <DraggableSectionList
              initialNumToRender={10}
              contentContainerStyle={{ paddingBottom: 100 }}
              autoscrollSpeed={200}
              data={
                sharedAppStateStore.hash.length
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
            // Completed Tasks
          )
        ) : (
          <SectionList
            initialNumToRender={10}
            keyExtractor={uuid}
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
