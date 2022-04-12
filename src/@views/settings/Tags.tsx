import { Alert } from 'react-native'
import { Component } from 'react'
import { Container, Text, View } from 'native-base'
import { Divider } from '@components/Divider'
import { FlatList } from 'react-native-gesture-handler'
import { IconButton } from '@components/IconButton'
import { MelonTag } from '@models/MelonTag'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { alertConfirm } from '@utils/alert'
import { cloneTag } from '@models/Tag'
import { database } from '@utils/watermelondb/wmdb'
import { makeObservable, observable } from 'mobx'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'
import { translate } from '@utils/i18n'
import React from 'react'
import fonts from '@utils/fonts'
import withObservables from '@nozbe/with-observables'

class TagsVM {
  deleteTag(tag: MelonTag) {
    alertConfirm(
      `${translate('deleteTodo')} "#${
        tag.tag.length > 50 ? `${tag.tag.substr(0, 50)}...` : tag.tag
      }"?`,
      translate('delete'),
      async () => {
        await tag.delete('deleting tag')
        await sharedTagStore.refreshTags()
        sharedSync.sync(SyncRequestEvent.Tag)
      }
    )
  }

  changeColor(tag: MelonTag) {
    navigate('ColorPicker', { tag })
  }

  async changeColorToDefault(tag: MelonTag) {
    await tag.changeColor('', 'changing color to default')
    await sharedTagStore.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }
  makeAnEpic(tag: MelonTag) {
    navigate('AddEpic', { tag })
  }
  editText(tag: MelonTag) {
    navigate('ChangeText', { tag: { ...cloneTag(tag) } })
  }
  unEpic(tag: MelonTag) {
    alertConfirm(
      `${translate('unEpicConfirm')} "#${
        tag.tag.length > 50 ? `${tag.tag.substr(0, 50)}...` : tag.tag
      }"?`,
      translate('unEpic'),
      async () => {
        await tag.unEpic('unepicing tag')
        sharedTagStore.refreshTags()
        sharedSync.sync(SyncRequestEvent.Tag)
      }
    )
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
    return this.tagsAmount ? (
      <TableItem
        onPress={() => {
          setTimeout(() => {
            Alert.alert(translate('deleteAllHashtagsConfirm'), '', [
              {
                text: translate('delete'),
                onPress: async () => {
                  const undeletedTags =
                    await sharedTagStore.undeletedTags.fetch()
                  const toUpdate = [] as MelonTag[]
                  for (const tag of undeletedTags) {
                    toUpdate.push(
                      tag.prepareUpdateWithDescription(
                        (tagToUpdate) => (tagToUpdate.deleted = true),
                        'deleting all tags'
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
  render() {
    return (
      <Container
        style={{
          backgroundColor: sharedColors.backgroundColor,
        }}
      >
        <EnhancedTagList tags={sharedTagStore.undeletedTags} />
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
      ListEmptyComponent={
        <Text
          style={{
            ...sharedColors.regularTextExtraStyle.style,
            textAlign: 'center',
            padding: 20,
          }}
        >
          {translate('emptyHashtags')}
        </Text>
      }
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
                <IconButton
                  onPress={() => {
                    item.epic ? vm.unEpic(item) : vm.makeAnEpic(item)
                  }}
                  name="target_outline_28"
                  color={item.epic ? 'gray' : undefined}
                />
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
