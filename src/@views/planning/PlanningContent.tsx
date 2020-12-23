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
import Animated, { Value } from 'react-native-reanimated'

@observer
export class PlanningContent extends Component {
  vm = new PlanningVM()

  @observable currentMonth = new Date().getMonth()
  @observable currentYear = new Date().getUTCFullYear()

  currentX = new Value(0)
  currentY = new Value(0)

  todoHeight = 0

  lastTimeY = 0
  lastTimeX = 0

  setCoordinates(yAx: number, xAx: number) {
    if (!this.lastTimeX || !this.lastTimeY) {
      this.lastTimeY = yAx
      this.lastTimeX = xAx
    }
    if (
      Math.abs(this.lastTimeX - xAx) > 30 ||
      Math.abs(this.lastTimeY - yAx) > 40
    ) {
      this.lastTimeX = xAx
      this.lastTimeY = yAx
      sharedAppStateStore.activeCoordinates = { x: xAx, y: yAx }
    }
    this.currentX.setValue(xAx)
    this.currentY.setValue(yAx - this.todoHeight)
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
                  .locale(
                    sharedSettingsStore.language
                      ? sharedSettingsStore.language
                      : 'en'
                  )
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
                  sharedAppStateStore.activeDay = day
                }}
                dark={sharedColors.isDark}
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
        {sharedAppStateStore.activeDay && (
          <Animated.View
            style={{
              ...styles.circle,
              transform: [
                {
                  translateX: this.currentX,
                },
                {
                  translateY: this.currentY,
                },
              ],
            }}
          />
        )}
        {sharedAppStateStore.todoSection !== TodoSectionType.completed ? (
          this.vm.uncompletedTodosArray.length ? (
            <DraggableSectionList
              onViewableItemsChanged={() => {
                sharedAppStateStore.changeLoading(false)
              }}
              contentContainerStyle={{ paddingBottom: 100 }}
              onMove={({ nativeEvent: { absoluteX, absoluteY } }) => {
                this.setCoordinates(absoluteY, absoluteX)
              }}
              autoscrollSpeed={200}
              data={
                sharedAppStateStore.hash.length ||
                sharedAppStateStore.searchQuery[0]
                  ? this.vm.allTodosAndHash
                  : this.vm.uncompletedTodosArray
              }
              layoutInvalidationKey={this.vm.theoreticalKey}
              keyExtractor={(item, index) => {
                return `${index}-${item._tempSyncId || item._id || item}`
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
                  <View
                    style={{ padding: isActive ? 10 : 0 }}
                    key={index}
                    onLayout={(e) => {
                      if (!index) return
                      this.todoHeight = e.nativeEvent.layout.height
                    }}
                  >
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
          <SectionList
            onViewableItemsChanged={() => {
              sharedAppStateStore.changeLoading(false)
            }}
            refreshing={true}
            initialNumToRender={10}
            keyExtractor={(item, index) => {
              return `${index}-${item._tempSyncId || item._id || item}`
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

let styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: sharedColors.primaryColor,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})
