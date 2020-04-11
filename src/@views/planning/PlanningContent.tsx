import React, { Component } from 'react'
import { Container, Text, H1, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import ActionButton from 'react-native-action-button'
import {
  sharedAppStateStore,
  TodoSectionType,
  PlanningMode,
} from '@stores/AppStateStore'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { plusButtonAction } from '@utils/plusButtonAction'
import { PlanningVM } from '@views/planning/PlanningVM'

@observer
export class PlanningContent extends Component {
  vm = new PlanningVM()

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {sharedTodoStore.isPlanningRequired && (
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
        {this.vm.todosWithSections.length ? (
          sharedAppStateStore.planningMode === PlanningMode.default ? (
            <DraggableFlatList
              data={this.vm.todosWithSections}
              renderItem={({ item, index, drag, isActive }) =>
                item.title ? (
                  <TouchableWithoutFeedback
                    key={index}
                    onLongPress={
                      sharedAppStateStore.todoSection ===
                        TodoSectionType.planning &&
                      sharedAppStateStore.planningMode ===
                        PlanningMode.rearrange
                        ? drag
                        : undefined
                    }
                    style={{ paddingHorizontal: isActive ? 10 : 0 }}
                  >
                    <Text
                      style={{
                        marginHorizontal: 10,
                        marginTop: 16,
                        ...sharedColors.textExtraStyle.style,
                      }}
                      key={index}
                    >
                      {item.title}
                    </Text>
                  </TouchableWithoutFeedback>
                ) : (
                  <View style={{ padding: isActive ? 10 : 0 }}>
                    <TodoCard
                      todo={item.item!}
                      type={
                        sharedAppStateStore.todoSection ===
                        TodoSectionType.planning
                          ? CardType.planning
                          : CardType.done
                      }
                      drag={drag}
                    />
                  </View>
                )
              }
              keyExtractor={(_, index) => `${index}`}
              onDragEnd={this.vm.onDragEnd}
            />
          ) : (
            <DraggableFlatList
              data={this.vm.todosWithSections}
              renderItem={({ item, index, drag, isActive }) =>
                item.title ? (
                  <TouchableWithoutFeedback
                    key={index}
                    onLongPress={
                      sharedAppStateStore.todoSection ===
                      TodoSectionType.planning
                        ? drag
                        : undefined
                    }
                    style={{ paddingHorizontal: isActive ? 10 : 0 }}
                  >
                    <Text
                      style={{
                        marginHorizontal: 10,
                        marginTop: 16,
                        ...sharedColors.textExtraStyle.style,
                      }}
                      key={index}
                    >
                      {item.title}
                    </Text>
                  </TouchableWithoutFeedback>
                ) : (
                  <View style={{ padding: isActive ? 10 : 0 }}>
                    <TodoCard
                      todo={item.item!}
                      type={
                        sharedAppStateStore.todoSection ===
                        TodoSectionType.planning
                          ? CardType.planning
                          : CardType.done
                      }
                      drag={drag}
                    />
                  </View>
                )
              }
              keyExtractor={(_, index) => `${index}`}
              onDragEnd={this.vm.onDragEnd}
            />
          )
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              margin: 12,
            }}
          >
            <H1 {...sharedColors.textExtraStyle}>👀</H1>
            <H1 {...sharedColors.textExtraStyle}>
              {translate('noTodosExistTitle')}
            </H1>
            <Text
              style={{ textAlign: 'center', color: sharedColors.textColor }}
            >
              {translate('noTodosExistText')}
            </Text>
          </View>
        )}
        <ActionButton
          buttonColor={sharedColors.primaryColor}
          buttonTextStyle={{ color: sharedColors.invertedTextColor }}
          onPress={plusButtonAction}
          useNativeFeedback={true}
          fixNativeFeedbackRadius={true}
        />
      </Container>
    )
  }
}
