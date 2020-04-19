import React, { Component } from 'react'
import { Container, Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import ActionButton from 'react-native-action-button'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { plusButtonAction } from '@utils/plusButtonAction'
import { PlanningVM } from '@views/planning/PlanningVM'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'

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
          <DraggableFlatList
            data={this.vm.todosWithSections}
            renderItem={({ item, index, drag, isActive }) =>
              item.title ? (
                <TouchableWithoutFeedback
                  key={index}
                  onLongPress={
                    sharedAppStateStore.todoSection === TodoSectionType.planning
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
                <View style={{ padding: isActive ? 10 : 0 }} key={index}>
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
          <NoTodosPlaceholder />
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
