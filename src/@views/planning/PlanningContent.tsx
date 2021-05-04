import React, { Component } from 'react'
import { Container, Text, View, Icon } from 'native-base'
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
import {
  SectionList,
  SectionListData,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Month } from '@upacyxou/react-native-month'
import { makeObservable, observable, when } from 'mobx'
import moment from 'moment'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { getDateString } from '@utils/time'
import Animated, { Value } from 'react-native-reanimated'
import { navigate } from '@utils/navigation'
import { Todo } from '@models/Todo'
import { debounce } from 'lodash'
import { TodoHeader } from '@components/TodoHeader'
import { hydration } from '@stores/hydration/hydratedStores'

@observer
export class PlanningContent extends Component {
  @observable vm?: PlanningVM

  @observable currentMonth = new Date().getMonth()
  @observable currentYear = new Date().getUTCFullYear()

  currentX = new Value(0)
  currentY = new Value(0)

  todoHeight = 0

  lastTimeY = 0
  lastTimeX = 0

  async UNSAFE_componentWillMount() {
    makeObservable(this)

    await when(() => hydration.isHydrated)
    this.vm = new PlanningVM()
  }

  setCoordinates = debounce(
    (yAx: number, xAx: number) => {
      sharedAppStateStore.activeCoordinates = { x: xAx, y: yAx }
    },
    1000,
    { maxWait: 250 }
  )

  renderPlanningRequiredMessage() {
    return (
      sharedTodoStore.isPlanningRequired &&
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
      )
    )
  }

  renderCalendar() {
    return (
      !!sharedAppStateStore.calendarEnabled && (
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
                if (!sharedAppStateStore.calendarEnabled) return
                sharedAppStateStore.activeDay = day
              }}
              dark={sharedSettingsStore.isDark}
              onPress={(day: Date) => {
                navigate('AddTodo', { date: getDateString(day) })
              }}
              emptyDays={(emptyDays: any) => {}}
              activeCoordinates={sharedAppStateStore.activeCoordinates}
              month={this.currentMonth}
              year={this.currentYear}
              showWeekdays
              locale={sharedSettingsStore.language}
            />
          </View>
        </View>
      )
    )
  }

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        {this.renderPlanningRequiredMessage()}
        {this.renderCalendar()}
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
          this.vm?.uncompletedTodosData.todosArray.length ? (
            <DraggableSectionList<Todo, SectionListData<Todo>>
              onEndReached={() => {
                sharedAppStateStore.changeLoading(true)
                setTimeout(() => this.vm?.uncompletedTodosData.increaseOffset())
              }}
              onEndReachedThreshold={0.3}
              onViewableItemsChanged={() => {
                sharedAppStateStore.changeLoading(false)
              }}
              contentContainerStyle={{ paddingBottom: 100 }}
              onMove={({ nativeEvent: { absoluteX, absoluteY } }) => {
                this.currentX.setValue(absoluteX as any)
                this.currentY.setValue((absoluteY - this.todoHeight) as any)
                this.setCoordinates(absoluteY, absoluteX)
              }}
              autoscrollSpeed={200}
              data={
                (sharedAppStateStore.hash.length ||
                sharedAppStateStore.searchQuery.length > 0
                  ? this.vm.uncompletedTodosData.allTodosAndHash?.slice()
                  : this.vm.uncompletedTodosData.todosArray) || []
              }
              layoutInvalidationKey={
                this.vm.uncompletedTodosData.invalidationKey
              }
              keyExtractor={(item, index) => {
                return `${index}-${
                  (item as Todo)._tempSyncId || (item as Todo)._id || item
                }`
              }}
              onDragEnd={this.vm.onDragEnd}
              isSectionHeader={(a: any) => {
                if (a === undefined) {
                  return false
                }
                return !a.text
              }}
              renderItem={({ item, index, drag, isActive }) => {
                if (!item) return
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
                      todo={item as Todo}
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
                  <TodoHeader
                    date={true}
                    drag={drag}
                    isActive={isActive}
                    item={item.section}
                    key={index}
                    vm={this.vm}
                  />
                )
              }}
              stickySectionHeadersEnabled={false}
            />
          ) : (
            <NoTodosPlaceholder />
          )
        ) : this.vm?.completedTodosData.todosArray.length ? (
          <SectionList
            onEndReached={() => {
              sharedAppStateStore.changeLoading(true)
              setTimeout(() => this.vm?.completedTodosData.increaseOffset())
            }}
            onEndReachedThreshold={0.3}
            onViewableItemsChanged={() => {
              sharedAppStateStore.changeLoading(false)
            }}
            refreshing={true}
            keyExtractor={(item, index) => {
              return `${index}-${item._tempSyncId || item._id || item}`
            }}
            sections={this.vm.completedTodosData.todosArray}
            renderItem={({ item }) => (
              <TodoCard
                todo={item as Todo}
                type={
                  sharedAppStateStore.todoSection === TodoSectionType.planning
                    ? CardType.planning
                    : CardType.done
                }
              />
            )}
            renderSectionHeader={({ section }) => (
              <TodoHeader
                item={section.section}
                vm={this.vm}
                drag={() => {}}
                isActive={false}
                date={true}
              />
            )}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          sharedAppStateStore.changeLoading(false)
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
