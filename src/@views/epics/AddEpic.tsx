import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Tag } from '@models/Tag'
import { Text, Button, Icon, View, Input } from 'native-base'
import { RouteProp, useRoute } from '@react-navigation/native'
import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import { sharedTagStore } from '@stores/TagStore'
import { goBack } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { extraButtonProps } from '@utils/extraButtonProps'
import { translate } from '@utils/i18n'

const AddEpicStore = {
  save: () => {},
}

export class AddEpicHeaderRight extends Component {
  render() {
    return (
      <Button
        icon
        {...extraButtonProps(sharedColors)}
        small
        onPress={() => {
          AddEpicStore.save()
        }}
      >
        <Icon
          type="MaterialIcons"
          name="done"
          {...sharedColors.iconExtraStyle}
        />
      </Button>
    )
  }
}

@observer
class AddEpicContent extends Component<{
  route: RouteProp<Record<string, { tag: Tag } | undefined>, string>
}> {
  @observable tag?: Tag
  @observable epicGoal: number | undefined

  componentDidMount() {
    this.tag = this.props.route.params?.tag
    AddEpicStore.save = () => {
      this.save()
    }
  }

  save() {
    const dbtag = sharedTagStore.getTagById(
      this.tag?._id || this.tag?._tempSyncId
    )
    if (!dbtag) {
      return
    }
    realm.write(() => {
      dbtag.epic = true
      dbtag.epicGoal = this.epicGoal
      dbtag.updatedAt = new Date()
    })
    goBack()
    sharedTagStore.refreshTags()
    sockets.tagsSyncManager.sync()
  }
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Text>{`#${this.tag?.tag}`}</Text>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Input
            onChangeText={(text) => {
              this.epicGoal = parseInt(text)
            }}
            placeholder={translate('epicGoal')}
            keyboardType="number-pad"
            style={{
              flex: 1,
              flexDirection: 'row',
              color: 'green',
              textAlign: 'center',
            }}
          />
        </View>
      </View>
    )
  }
}

export const AddEpic = () => {
  const route = useRoute<
    RouteProp<Record<string, { tag: Tag } | undefined>, string>
  >()
  return <AddEpicContent route={route} />
}
