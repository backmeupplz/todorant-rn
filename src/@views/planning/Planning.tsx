import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Text, Segment, Button, Icon, H1, View } from 'native-base'
import { computed, observe } from 'mobx'
import { Todo, compareTodos, getTitle, isTodoOld } from '@models/Todo'
import { observer, Observer } from 'mobx-react'
import { sharedTodoStore } from '@stores/TodoStore'
import { isDateTooOld, getDateString } from '@utils/time'
import { TodoCard, CardType } from '@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { AddTodo } from '@views/add/AddTodo'
import {
  sharedAppStateStore,
  TodoSectionType,
  PlanningMode,
} from '@stores/AppStateStore'
import DraggableFlatList from 'react-native-draggable-flatlist'
import {
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler'
import { realm } from '@utils/realm'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Platform } from 'react-native'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/LoginTelegram'
import { plusButtonAction } from '@utils/plusButtonAction'
import { InfoButton } from '@views/settings/InfoButton'
import { fixOrder } from '@utils/fixOrder'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sockets } from '@utils/sockets'

const Stack = createStackNavigator()

interface SectionHeaderOrTodo {
  title?: string
  item?: Todo
}

class PlanningVM {
  @computed get allTodosFiltered() {
    return sharedTodoStore.allTodos
      .filtered('deleted = false')
      .filtered(
        `completed = ${!(
          sharedAppStateStore.todoSection === TodoSectionType.planning ||
          !!sharedAppStateStore.hash
        )}`
      )
  }

  @computed get allTodosAndHash() {
    return sharedAppStateStore.hash
      ? this.allTodosFiltered.filtered(
          `${`text CONTAINS[c] "${sharedAppStateStore.hash}"`}`
        )
      : this.allTodosFiltered
  }

  @computed get todosWithSections() {
    const mappedTodos = this.allTodosAndHash.reduce((prev, cur) => {
      if (cur.date) {
        const date = `${cur.monthAndYear}-${cur.date}`
        if (prev[date]) {
          prev[date].push(cur)
        } else {
          prev[date] = [cur]
        }
      } else {
        const month = cur.monthAndYear
        if (prev[month]) {
          prev[month].push(cur)
        } else {
          prev[month] = [cur]
        }
      }
      return prev
    }, {} as { [index: string]: Todo[] })
    const gatheredTodos = [] as {
      title: string
      todos: Todo[]
    }[]
    for (const key in mappedTodos) {
      gatheredTodos.push({
        title: key,
        todos: mappedTodos[key],
      })
    }
    const today = getDateString(new Date())
    gatheredTodos.sort((a, b) => {
      if (isDateTooOld(a.title, today) && !isDateTooOld(b.title, today)) {
        return sharedAppStateStore.todoSection === TodoSectionType.planning
          ? -1
          : 1
      } else if (
        !isDateTooOld(a.title, today) &&
        isDateTooOld(b.title, today)
      ) {
        return sharedAppStateStore.todoSection === TodoSectionType.planning
          ? 1
          : -1
      }
      return sharedAppStateStore.todoSection === TodoSectionType.planning
        ? new Date(a.title) > new Date(b.title)
          ? 1
          : -1
        : new Date(a.title) < new Date(b.title)
        ? 1
        : -1
    })
    let result: SectionHeaderOrTodo[] = []
    for (const todoSection of gatheredTodos) {
      result = [
        ...result,
        {
          title: todoSection.title,
        },
        ...todoSection.todos
          .sort(
            compareTodos(
              sharedAppStateStore.todoSection === TodoSectionType.completed
            )
          )
          .map((v) => ({ item: v })),
      ]
    }
    return result
  }

  onDragEnd = ({
    data,
    from,
    to,
  }: {
    data: SectionHeaderOrTodo[]
    from: number
    to: number
  }) => {
    // Create the map of werre titles start and end
    const titleToIndexes = [] as [string, number, number][] // title, startIndex, endIndex
    this.todosWithSections.forEach((item, i) => {
      if (item.title) {
        titleToIndexes.push([item.title, i, i])
        if (titleToIndexes.length > 1) {
          titleToIndexes[titleToIndexes.length - 2][2] = i - 1
        }
      }
    })
    // Create a placeholder for the affected titles to fix order later
    const affectedTitles = [] as string[]
    // Get the dragged item
    const draggedItem = this.todosWithSections[from]
    // If it is todo, then derive from and to titles to add to affected titles
    if (draggedItem.item) {
      const titleFrom = getTitle(draggedItem.item)
      let titleTo: string | undefined
      if (to === 0) {
        titleTo = titleToIndexes[0][0]
      } else {
        for (const titleToIndex of [...titleToIndexes].reverse()) {
          if (to > from ? to >= titleToIndex[1] : to > titleToIndex[1]) {
            titleTo = titleToIndex[0]
            break
          }
        }
      }
      if (titleTo) {
        if (titleFrom === titleTo) {
          affectedTitles.push(titleFrom)
        } else {
          affectedTitles.push(titleFrom, titleTo)
        }
      }
    }
    // It it is title add itself and its old and new neighbours to affected titles
    else if (draggedItem.title) {
      // Add the title
      affectedTitles.push(draggedItem.title)
      // Add old neighbours
      titleToIndexes.forEach((titleToIndex, i) => {
        if (titleToIndex[0] === draggedItem.title) {
          if (i - 1 > -1) {
            affectedTitles.push(titleToIndexes[i - 1][0])
          }
          if (i + 1 < titleToIndexes.length) {
            affectedTitles.push(titleToIndexes[i + 1][0])
          }
        }
      })
      // Add new neighbours
      for (const titleToIndex of titleToIndexes) {
        if (to > titleToIndex[1] && to <= titleToIndex[2]) {
          if (affectedTitles.indexOf(titleToIndex[0]) < 0) {
            affectedTitles.push(titleToIndex[0])
          }
        }
      }
    }
    // Get a copy of affected titles (we are going to modify the original array)
    const affectedTitlesCopy = [...affectedTitles]
    // Get first title
    let currentTitle = ''
    let currentMonthAndYear = ''
    let currentDate: string | undefined
    for (const sectionHeaderOrTodo of data) {
      if (sectionHeaderOrTodo.title) {
        currentTitle = sectionHeaderOrTodo.title
        currentMonthAndYear = currentTitle.substr(0, 7)
        currentDate =
          currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
        break
      }
    }
    // Go over all titles and todos, make note of all affected todos and titles
    let titleCounter = ''
    const affectedSectionHeadersOrTodo = [] as SectionHeaderOrTodo[]
    for (const sectionHeaderOrTodo of data) {
      if (sectionHeaderOrTodo.title) {
        const prevIndex = affectedTitles.indexOf(titleCounter)
        if (prevIndex > -1) {
          affectedTitles.splice(prevIndex, 1)
          if (!affectedTitles.length) {
            break
          }
        }
        titleCounter = sectionHeaderOrTodo.title
      }
      if (!titleCounter || affectedTitles.indexOf(titleCounter) > -1) {
        affectedSectionHeadersOrTodo.push(sectionHeaderOrTodo)
      }
    }
    // Fix order of tasks and titles
    let orderCounter = 0
    affectedSectionHeadersOrTodo.forEach((sectionHeaderOrTodo) => {
      if (sectionHeaderOrTodo.title) {
        if (sectionHeaderOrTodo.title !== currentTitle) {
          orderCounter = 0
        }
        currentTitle = sectionHeaderOrTodo.title
        currentMonthAndYear = currentTitle.substr(0, 7)
        currentDate =
          currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
      } else if (sectionHeaderOrTodo.item) {
        const todo = sectionHeaderOrTodo.item
        if (
          todo.order !== orderCounter ||
          todo.monthAndYear !== currentMonthAndYear ||
          todo.date !== currentDate
        ) {
          const failed = isTodoOld(todo)
          realm.write(() => {
            todo.order = orderCounter
            todo.monthAndYear = currentMonthAndYear
            todo.date = currentDate
            todo._exactDate = new Date(getTitle(todo))
            if (failed) {
              todo.frogFails++
              if (todo.frogFails > 1) {
                todo.frog = true
              }
            }
          })
        }
        orderCounter++
      }
    })
    // Sync and fix time order if necessary
    if (sharedSettingsStore.preserveOrderByTime) {
      fixOrder(
        affectedTitlesCopy,
        undefined,
        undefined,
        draggedItem.item ? [draggedItem.item] : undefined
      )
    } else {
      // Refresh
      sharedTodoStore.refreshTodos()
      sockets.todoSyncManager.sync()
    }
  }
}

@observer
class TodoCardPlanningVariable extends Component<{
  item: Todo
  drag: () => void
}> {
  render() {
    return sharedAppStateStore.planningMode === PlanningMode.default ? (
      <TodoCard
        todo={this.props.item}
        type={
          sharedAppStateStore.todoSection === TodoSectionType.planning
            ? CardType.planning
            : CardType.done
        }
      />
    ) : (
      <TouchableOpacity onPressIn={this.props.drag}>
        <TodoCard
          todo={this.props.item}
          type={
            sharedAppStateStore.todoSection === TodoSectionType.planning
              ? CardType.planning
              : CardType.done
          }
        />
      </TouchableOpacity>
    )
  }
}

@observer
class PlanningContent extends Component {
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
                <View style={{ padding: isActive ? 10 : 0 }}>
                  <TodoCardPlanningVariable item={item.item!} drag={drag} />
                </View>
              )
            }
            keyExtractor={(_, index) => `${index}`}
            onDragEnd={this.vm.onDragEnd}
          />
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

@observer
class PlanningHeader extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>{sharedAppStateStore.hash}</Text>
    ) : sharedAppStateStore.planningMode === PlanningMode.rearrange ? (
      <Text {...sharedColors.textExtraStyle}>{translate('rearrange')}</Text>
    ) : (
      <Segment>
        <Button
          first
          active={sharedAppStateStore.todoSection === TodoSectionType.planning}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.planning
          }}
          style={{
            borderColor: sharedColors.primaryColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.planning
                ? sharedColors.primaryColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.planning
                  ? sharedColors.backgroundColor
                  : sharedColors.primaryColor,
            }}
          >
            {translate('planning')}
          </Text>
        </Button>
        <Button
          transparent
          last
          active={sharedAppStateStore.todoSection === TodoSectionType.completed}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.completed
          }}
          style={{
            borderColor: sharedColors.primaryColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.completed
                ? sharedColors.primaryColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.completed
                  ? sharedColors.backgroundColor
                  : sharedColors.primaryColor,
            }}
          >
            {translate('completed')}
          </Text>
        </Button>
      </Segment>
    )
  }
}

@observer
class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Button
        icon
        transparent
        small
        onPress={() => {
          sharedAppStateStore.hash = ''
        }}
      >
        <Icon
          type="MaterialIcons"
          name="close"
          {...sharedColors.iconExtraStyle}
        />
      </Button>
    ) : (
      InfoButton('infoPlanning')()
    )
  }
}

@observer
class PlanningHeaderLeft extends Component {
  render() {
    return (
      !sharedAppStateStore.hash &&
      sharedAppStateStore.todoSection === TodoSectionType.planning && (
        <Button
          icon
          transparent={Platform.OS === 'ios'}
          style={{
            backgroundColor:
              Platform.OS === 'android'
                ? sharedColors.backgroundColor
                : undefined,
            elevation: 0,
          }}
          small
          onPress={() => {
            sharedAppStateStore.planningMode =
              sharedAppStateStore.planningMode === PlanningMode.default
                ? PlanningMode.rearrange
                : PlanningMode.default
          }}
        >
          <Icon
            type="MaterialIcons"
            name={
              sharedAppStateStore.planningMode === PlanningMode.default
                ? 'format-list-numbered'
                : 'close'
            }
            {...sharedColors.textExtraStyle}
          />
        </Button>
      )
    )
  }
}

export function Planning() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator>
          <Stack.Screen
            name="Planning"
            component={PlanningContent}
            options={{
              headerTitle: () => {
                return <PlanningHeader />
              },
              headerRight: () => {
                return <PlanningHeaderRight />
              },
              headerLeft: () => {
                return <PlanningHeaderLeft />
              },
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="AddTodo"
            component={AddTodo}
            options={{
              title: translate('addTodo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoAdd'),
            }}
          />
          <Stack.Screen
            name="EditTodo"
            component={AddTodo}
            options={{
              title: translate('editTodo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoEdit'),
            }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: translate('pleaseLogin'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Paywall"
            component={Paywall}
            options={{
              title: translate('subscription'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsOfUse}
            options={{
              title: translate('termsOfUse'),
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyPolicy}
            options={{
              title: translate('privacyPolicy'),
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="LoginTelegram"
            component={LoginTelegram}
            options={{
              title: translate('loginTelegram'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
