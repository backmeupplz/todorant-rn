import { Button, Icon, Input, Text, View } from 'native-base'
import { MelonTag } from '@models/MelonTag'
import { RouteProp, useRoute } from '@react-navigation/native'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { extraButtonProps } from '@utils/extraButtonProps'
import { goBack } from '@utils/navigation'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'

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
  route: RouteProp<Record<string, { tag: MelonTag } | undefined>, string>
}> {
  @observable tag?: MelonTag
  @observable epicGoal: number | undefined

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    this.tag = this.props.route.params?.tag
    AddEpicStore.save = () => {
      this.save()
    }
  }

  async save() {
    if (!this.epicGoal || +this.epicGoal <= 0) {
      return
    }
    await this.tag?.turnTagToEpic(this.epicGoal, 'turning tag in epic')
    goBack()
    sharedTagStore.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ maxWidth: '80%', color: this.tag?.color || 'dodgerblue' }}
          >{`#${this.tag?.tag}`}</Text>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <Input
              onChangeText={(text) => {
                this.epicGoal = parseInt(text)
              }}
              placeholder={translate('epic.epicGoal')}
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
      </View>
    )
  }
}

export const AddEpic = () => {
  const route =
    useRoute<RouteProp<Record<string, { tag: MelonTag } | undefined>, string>>()
  return <AddEpicContent route={route} />
}
