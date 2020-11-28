import React, { Component, PureComponent } from 'react'
import { Button, Container, Text, View } from 'native-base'
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
class TestClass extends PureComponent<{ text: string }> {
  render() {
    return (
      <View>
        <Text>{this.props.text}</Text>
      </View>
    )
  }
}

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
        {Object.keys(this.vm.uncompletedTodosMap).length ? (
          <DraggableSectionList
            contentContainerStyle={{ paddingBottom: 100 }}
            autoscrollSpeed={200}
            data={this.vm.uncompletedTodosArray}
            keyExtractor={(item, index) => {
              return `${index}-${item._id || item._tempSyncId || item}`
            }}
            onDragEnd={this.vm.onDragEnd}
            isSectionHeader={(a: any) => {
              return !a.atom
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
        )}
        <PlusButton />
      </Container>
    )
  }
}
