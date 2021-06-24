import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedTodoStore } from '@stores/TodoStore'
import { Button, Container, Text, View } from 'native-base'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { SegmentedProgressView } from '@components/SegmentedProgressView'
import { PlusButton } from '@components/PlusButton'
import { sharedTagStore } from '@stores/TagStore'
import { EpicProgress } from './EpicProgress'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { realm } from '@utils/realm'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { MelonTodo } from '@models/MelonTodo'
import withObservables from '@nozbe/with-observables'
import { database, todosCollection } from '../../../App'
import { makeObservable, observable } from 'mobx'
import { v4 } from 'uuid'
import { getTitle } from '@models/Todo'
import { SectionList } from 'react-native'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { IconButton } from '@components/IconButton'

export let currentTodoNodeId: number

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()

  todos = todosCollection.query(
    Q.where('is_completed', false),
    Q.where('is_deleted', false),
    Q.where('text', Q.notEq('')),
    Q.experimentalTake(1)
  )

  @observable loading = false

  state = { completedToday: 0 }

  async UNSAFE_componentWillMount() {
    makeObservable(this)
    this.setState({
      completedToday: await todosCollection
        .query(Q.where('is_completed', true))
        .fetchCount(),
    })
    todosCollection
      .query(Q.where('is_completed', true))
      .observe()
      .subscribe((amount) => this.setState({ completedToday: amount.length }))
  }

  render() {
    return (
      <Container {...({ language: sharedSettingsStore.language } as any)}>
        <HeaderScrollView
          title={translate('current')}
          showsHeroButton
          infoTitle="infoCurrent"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {!!sharedTagStore.undeletedTags.filter((tag) => tag.epic).length && (
            <View style={{ marginTop: 16 }}>
              <DraggableFlatList
                data={sharedTagStore.undeletedTags
                  .filter((tag) => tag.epic)
                  .sort((a, b) => {
                    if ((a.epicOrder ?? 0) < (b.epicOrder ?? 0)) return -1
                    return 1
                  })}
                renderItem={({ item, index, drag, isActive }) => {
                  return <EpicProgress epic={item} key={index} drag={drag} />
                }}
                keyExtractor={(_, index) => `draggable-epic-${index}`}
                onDragEnd={(epics) => {
                  realm.write(() => {
                    epics.data.map((epic, index) => {
                      epic.epicOrder = index
                      epic.updatedAt = new Date()
                    })
                    sharedTagStore.refreshTags()
                    sharedSync.sync(SyncRequestEvent.Tag)
                  })
                }}
              />
            </View>
          )}
          {
            <SegmentedProgressView
              completed={this.state.completedToday}
              total={100}
            />
          }
          {false && (
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                currentTodoNodeId = target
              }}
            >
              <ImReally todo={this.todos} />
            </View>
          )}
          {/* {true && <EnhancedTodo todos={this.todos} />} */}
        </HeaderScrollView>
        <PlusButton />
      </Container>
    )
  }
}

const Todo = ({ todos }: { todos: MelonTodo[] }) => {
  const todoSectionMap = {} as any
  let currentTitle: string | undefined
  let sectionIndex = 0

  for (const watermelonTodo of todos) {
    const todo = getTitle(watermelonTodo)
    if (currentTitle && currentTitle !== todo) {
      sectionIndex++
    }
    if (todoSectionMap[todo]) {
      todoSectionMap[todo].data.push(watermelonTodo as any)
    } else {
      todoSectionMap[todo] = {
        order: sectionIndex,
        section: todo,
        data: [watermelonTodo as any],
      }
    }
  }

  const whatINeed = Object.keys(todoSectionMap).map((key) => {
    return todoSectionMap[key]
  })

  return (
    <SectionList
      renderItem={({ item, index, section }) => {
        return <EnhancedTodo1 todo={item} />
      }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      )}
      sections={whatINeed}
      keyExtractor={(item) => item.id}
    />
  )
}

const enhance = withObservables(['todos'], ({ todos }) => {
  return {
    todos: todos,
  }
})

const EnhancedTodo = enhance(Todo)

const EnhancedTodoComponent = ({ todo }: { todo: MelonTodo }) => {
  return (
    <View>
      <Text>{todo.text}</Text>
      <Button
        onPress={async () => {
          await database.write(async () => {
            console.log(todo)
            await todo.update((post) => {
              post.text = v4()
              post.completed = true
            })
          })
        }}
      >
        <Text>change text</Text>
      </Button>
    </View>
  )
}

const enhance1 = withObservables(['todo'], ({ todo }) => {
  return {
    todo,
  }
})

const EnhancedTodo1 = enhance1(EnhancedTodoComponent)

const TryingEnhancedTodo = ({ todo }: { todo: MelonTodo }) => {
  return (
    <View>
      <Text>{todo[0].text}</Text>
      <TodoCard todo={todo[0]} type={CardType.current} />
      <IconButton
        onPress={async () => {
          await database.write(async () => {
            await todo[0].update((todo) => (todo.text = v4()))
          })
        }}
        name="edit_o111utline_28"
      />
    </View>
  )
}

const enhancedTest = withObservables(['todo'], ({ todo }) => {
  // console.log(todo)
  return {
    todo: todo.observeWithColumns(['text', 'frog']),
  }
})

const ImReally = enhancedTest(TryingEnhancedTodo)
