import { PlusButton } from '@components/PlusButton'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { Todo } from '@models/Todo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import DraggableFlatList from '@upacyxou/react-native-draggable-flatlist'
import { Month } from '@upacyxou/react-native-month'
import { translate } from '@utils/i18n'
import { realm } from '@utils/realm'
import { sharedColors } from '@utils/sharedColors'
import { sockets } from '@utils/sockets'
import { NoTodosPlaceholder } from '@views/planning/NoTodosPlaceholder'
import { PlanningVM } from '@views/planning/PlanningVM'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import { Container, Icon, Text, View } from 'native-base'
import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { PlanningDateHeader } from './PlanningDateHeader'

@observer
export class PlanningContent extends Component {
  vm = new PlanningVM()

  @observable currentMonth = new Date().getMonth()
  @observable currentYear = new Date().getUTCFullYear()

  @observable currentDate = new Date()

  todoHeight = 0

  setCoordinates(yAx: number, xAx: number) {
    sharedAppStateStore.activeCoordinates = { x: xAx, y: yAx }
  }

  onDragEndWrapper = ({ data, from, to }: any) => {
    const todo = data[to].item as Todo
    if (todo && sharedAppStateStore.activeDay) {
      realm.write(() => {
        todo._exactDate = this.currentDate
        todo.date =
          this.currentDate.getDate() <= 9
            ? `0${this.currentDate.getDate()}`
            : `${this.currentDate.getDate()}`
        todo.monthAndYear = `${this.currentDate.getFullYear()}-${
          this.currentDate.getMonth() + 1 <= 9
            ? `0${this.currentDate.getMonth() + 1}`
            : `${this.currentDate.getMonth() + 1}`
        }`
        todo.updatedAt = new Date()
      })
      sharedTodoStore.refreshTodos()
      sockets.todoSyncManager.sync()
    } else {
      this.vm.onDragEnd({ data, from, to })
    }
    sharedAppStateStore.activeDay = 0
    sharedAppStateStore.activeCoordinates = { x: 0, y: 0 }
  }

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
        {!!sharedAppStateStore.calendarEnabled && (
          <View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: 12,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (this.currentMonth <= 0) {
                    this.currentYear--
                    this.currentMonth = 11
                  } else {
                    this.currentMonth--
                  }
                }}
              >
                <Icon
                  type="MaterialIcons"
                  name={'keyboard-arrow-left'}
                  style={{ color: sharedColors.textColor, opacity: 0.5 }}
                />
              </TouchableOpacity>
              <Text style={{ color: sharedColors.textColor }}>
                {moment(this.currentMonth + 1, 'MM')
                  .locale(sharedSettingsStore.language!)
                  .format('MMMM')}{' '}
                {this.currentYear}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (this.currentMonth >= 11) {
                    this.currentYear++
                    this.currentMonth = 0
                  } else {
                    this.currentMonth++
                  }
                }}
              >
                <Icon
                  type="MaterialIcons"
                  name={'keyboard-arrow-right'}
                  style={{ color: sharedColors.textColor, opacity: 0.5 }}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Month
                onActiveDayChange={(day: Date) => {
                  this.currentDate = day
                  sharedAppStateStore.activeDay = day.getDate()
                }}
                dark={sharedSettingsStore.colorMode === 'dark'}
                onPress={(day: Date) => {}}
                emptyDays={(emptyDays: any) => {}}
                activeCoordinates={sharedAppStateStore.activeCoordinates}
                month={this.currentMonth}
                year={this.currentYear}
                showWeekdays
                locale="en"
              />
            </View>
          </View>
        )}
        {sharedAppStateStore.activeDay ? (
          <View
            style={{
              ...styles.circle,
              transform: [
                {
                  translateX: sharedAppStateStore.activeCoordinates.x,
                },
                {
                  translateY:
                    sharedAppStateStore.activeCoordinates.y - this.todoHeight,
                },
              ],
            }}
          />
        ) : (
          <View></View>
        )}
        {this.vm.todosWithSections.length ? (
          <DraggableFlatList
            thisArg={this}
            setCoordinates={this.setCoordinates}
            contentContainerStyle={{ paddingBottom: 100 }}
            autoscrollSpeed={200}
            data={this.vm.todosWithSections}
            renderItem={({ item, index, drag, isActive }) =>
              item.title ? (
                <PlanningDateHeader
                  drag={drag}
                  isActive={isActive}
                  item={item}
                  key={index}
                  vm={this.vm}
                />
              ) : (
                <View
                  onLayout={(e) => {
                    if (!index) return
                    this.todoHeight = e.nativeEvent.layout.height
                  }}
                  style={{
                    padding: isActive ? 10 : 0,
                  }}
                  key={index}
                >
                  <TodoCard
                    todo={item.item!}
                    type={
                      sharedAppStateStore.todoSection ===
                      TodoSectionType.planning
                        ? CardType.planning
                        : CardType.done
                    }
                    drag={drag}
                    active={false}
                  />
                </View>
              )
            }
            keyExtractor={(item, index) =>
              `${index}-${
                item.title || item.item?._id || item.item?._tempSyncId
              }`
            }
            onDragEnd={this.onDragEndWrapper}
          />
        ) : (
          <NoTodosPlaceholder />
        )}
        <PlusButton />
      </Container>
    )
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
