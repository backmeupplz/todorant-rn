import React, { Component } from 'react'
import { Container, Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { PlanningVM } from '@views/planning/PlanningVM'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlusButton } from '@components/PlusButton'
import { IconButton } from '@components/IconButton'
import { navigate } from '@utils/navigation'

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
            contentContainerStyle={{ paddingBottom: 100 }}
            autoscrollSpeed={200}
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
                  <View
                    style={{
                      marginHorizontal: 16,
                      marginTop: 16,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        ...sharedColors.textExtraStyle.style,
                      }}
                      key={index}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={{
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        onPress={() => {
                          navigate('AddTodo', { date: item.title })
                        }}
                        size={20}
                        name="add_outline_28"
                      />
                    </View>
                  </View>
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
            keyExtractor={(item, index) =>
              `${index}-${
                item.title || item.item?._id || item.item?._tempSyncId
              }`
            }
            onDragEnd={this.vm.onDragEnd}
          />
        ) : (
          <NoTodosPlaceholder />
        )}
        <PlusButton />
      </Container>
    )
  }
}
