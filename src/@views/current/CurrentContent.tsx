import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'
import { sharedTodoStore } from '@stores/TodoStore'
import { Container, View, Text } from 'native-base'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { SegmentedProgressView } from '@components/SegmentedProgressView'
import { PlusButton } from '@components/PlusButton'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { FlatList } from 'react-native-gesture-handler'
import { sharedTagStore } from '@stores/TagStore'
import { ProgressView } from '@components/ProgressView'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'
import { IconButton } from '@components/IconButton'

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()
  epics = sharedTagStore.undeletedTags.filter((tag) => tag.epic)

  componentDidMount() {
    setTimeout(() => {
      if (!sharedSessionStore.introMessageShown) {
        navigate('Intro')
      }
    }, 2 * 1000)
  }

  render() {
    // Hack to make this reactive
    let languageTag = sharedAppStateStore.languageTag
    languageTag = `${languageTag}`

    return (
      <Container {...({ language: sharedSettingsStore.language } as any)}>
        <HeaderScrollView
          title={translate('current')}
          showsHeroButton
          infoTitle="infoCurrent"
        >
          <FlatList
            style={{ marginVertical: 20 }}
            data={this.epics}
            keyExtractor={(item, index) => `key${index}`}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: item.color || sharedColors.primaryColor,
                      fontFamily: fonts.SFProRoundedRegular,
                      fontSize: 22,
                      marginHorizontal: 16,
                      marginBottom: -24,
                    }}
                  >
                    #{item.tag}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.SFProRoundedRegular,
                        fontSize: 22,
                        marginHorizontal: 16,
                        color: item.color || sharedColors.primaryColor,
                      }}
                    >
                      {item.epicPoints}
                    </Text>
                    <ProgressView
                      progress={item.epicPoints! / item.epicGoal!}
                      tintColor={item.color || sharedColors.primaryColor}
                      trackColor={sharedColors.progressBar}
                    />
                    {item.epicPoints != item.epicGoal ? (
                      <Text
                        style={{
                          fontFamily: fonts.SFProRoundedRegular,
                          fontSize: 22,
                          marginHorizontal: 16,
                          color: item.color || sharedColors.primaryColor,
                        }}
                      >
                        {item.epicGoal}
                      </Text>
                    ) : (
                      <View style={{ marginRight: 8 }}>
                        <IconButton
                          onPress={() => {
                            sharedTagStore.completeEpic(item)
                          }}
                          color={item.color || sharedColors.destructIconColor}
                          name="done_outline_28--check"
                        />
                      </View>
                    )}
                  </View>
                </View>
              )
            }}
          />
          {!!sharedTodoStore.progress.count && (
            <SegmentedProgressView
              completed={sharedTodoStore.progress.completed}
              total={sharedTodoStore.progress.count}
            />
          )}
          {!!this.vm.currentTodo && (
            <TodoCard todo={this.vm.currentTodo} type={CardType.current} />
          )}
          {!!sharedTodoStore.progress.count &&
            sharedTodoStore.progress.count ===
              sharedTodoStore.progress.completed && <AllDonePlaceholder />}
          {!sharedTodoStore.progress.count && <NoTodosPlaceholder />}
        </HeaderScrollView>
        <PlusButton />
      </Container>
    )
  }
}
