import React, { Component } from 'react'
import { Text, Container, ActionSheet, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { FlatList } from 'react-native-gesture-handler'
import { sharedTagStore } from '@stores/TagStore'
import { observer } from 'mobx-react'
import { Tag, cloneTag } from '@models/Tag'
import { translate } from '@utils/i18n'
import { alertConfirm } from '@utils/alert'
import { navigate } from '@utils/navigation'
import { TableItem } from '@components/TableItem'
import { Alert } from 'react-native'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { sharedSync } from '@sync/Sync'
import fonts from '@utils/fonts'
import { IconButton } from '@components/IconButton'
import { Divider } from '@components/Divider'
import { MelonTag } from '@models/MelonTag'
import withObservables from '@nozbe/with-observables'
import { makeObservable, observable } from 'mobx'
import { database } from '@utils/wmdb'

class TagsVM {
  deleteTag(tag: MelonTag) {
    alertConfirm(
      `${translate('deleteTodo')} "#${
        tag.tag.length > 50 ? `${tag.tag.substr(0, 50)}...` : tag.tag
      }"?`,
      translate('delete'),
      async () => {
        await tag.delete()
        await sharedTagStore.refreshTags()
        sharedSync.sync(SyncRequestEvent.Tag)
      }
    )
  }

  changeColor(tag: MelonTag) {
    navigate('ColorPicker', { tag })
  }

  async changeColorToDefault(tag: MelonTag) {
    await tag.changeColorToDefault()
    await sharedTagStore.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }
  makeAnEpic(tag: MelonTag) {
    navigate('AddEpic', { tag })
  }
  editText(tag: MelonTag) {
    navigate('ChangeText', { tag })
  }
}

@observer
class DeleteAllTagsButton extends Component {
  @observable tagsAmount = 0

  UNSAFE_componentWillMount() {
    makeObservable(this)
    sharedTagStore.undeletedTags
      .observeCount()
      .subscribe((amount) => (this.tagsAmount = amount))
  }

  render() {
    return !!this.tagsAmount ? (
      <TableItem
        onPress={() => {
          setTimeout(() => {
            Alert.alert(translate('deleteAllHashtagsConfirm'), '', [
              {
                text: translate('delete'),
                onPress: async () => {
                  const undeletedTags = await sharedTagStore.undeletedTags.fetch()
                  const toUpdate = [] as MelonTag[]
                  for (const tag of undeletedTags) {
                    toUpdate.push(
                      tag.prepareUpdate(
                        (tagToUpdate) => (tagToUpdate.deleted = true)
                      )
                    )
                  }
                  await database.write(
                    async () => await database.batch(...toUpdate)
                  )
                  await sharedTagStore.refreshTags()
                  sharedSync.sync(SyncRequestEvent.Tag)
                },
                style: 'destructive',
              },
              {
                text: translate('cancel'),
                style: 'cancel',
              },
            ])
          }, 100)
        }}
      >
        <Text style={{ color: sharedColors.destructIconColor, marginTop: 8 }}>
          {translate('deleteAllHashtags')}
        </Text>
      </TableItem>
    ) : null
  }
}

@observer
export class Tags extends Component {
  @observable tagsAmount = 0

  UNSAFE_componentWillMount() {
    makeObservable(this)
    sharedTagStore.undeletedTags
      .observeCount()
      .subscribe((amount) => (this.tagsAmount = amount))
  }

  render() {
    return (
      <Container
        style={{
          backgroundColor: sharedColors.backgroundColor,
        }}
      >
        {!!this.tagsAmount ? (
          <EnhancedTagList tags={sharedTagStore.undeletedTags} />
        ) : (
          <Text
            style={{
              ...sharedColors.regularTextExtraStyle.style,
              textAlign: 'center',
              padding: 20,
            }}
          >
            {translate('emptyHashtags')}
          </Text>
        )}
      </Container>
    )
  }
}

const enhance = withObservables(['tags'], ({ tags }) => {
  return {
    tags: tags.observeWithColumns(
      Object.keys(tags.collection.database.schema.tables.tags.columns)
    ),
  }
})

const EnhancedTagList = enhance(({ tags }: { tags: MelonTag[] }) => {
  const vm = new TagsVM()

  return (
    <FlatList
      ListHeaderComponent={DeleteAllTagsButton}
      data={tags}
      renderItem={({ item }) => {
        return (
          <View style={{ paddingHorizontal: 16, marginVertical: 8, flex: 1 }}>
            <View
              style={{
                borderColor: sharedColors.placeholderColor,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  maxWidth: '70%',
                  color: item.color || 'dodgerblue',
                  fontFamily: fonts.SFProTextRegular,
                }}
              >
                #{item.tag}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {!item.epic && (
                  <IconButton
                    onPress={() => {
                      vm.makeAnEpic(item)
                    }}
                    name="target_outline_28"
                  />
                )}
                <IconButton
                  onPress={() => {
                    vm.editText(item)
                  }}
                  name="edit_outline_28"
                />
                <IconButton
                  onPress={() => {
                    vm.deleteTag(item)
                  }}
                  color={sharedColors.destructIconColor}
                  name="delete_outline_28-iOS"
                />
              </View>
            </View>
            <Divider marginHorizontal={0} />
          </View>
        )
      }}
      keyExtractor={(tag) => tag._tempSyncId}
    />
  )
})
