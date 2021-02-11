import React, { Component } from 'react'
import { Tag } from '@models/Tag'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'
import { ProgressView } from '@components/ProgressView'
import { IconButton } from '@components/IconButton'
import { sharedTagStore } from '@stores/TagStore'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { navigate } from '@utils/navigation'

@observer
class EpicText extends Component<{
  text: string
  color?: string
  onPress?: () => void
}> {
  render() {
    return this.props.onPress ? (
      <TouchableOpacity onPress={this.props.onPress}>
        <Text
          style={{
            fontFamily: fonts.SFProRoundedRegular,
            fontSize: 22,
            marginHorizontal: 16,
            color: this.props.color || sharedColors.primaryColor,
          }}
        >
          {this.props.text}
        </Text>
      </TouchableOpacity>
    ) : (
      <Text
        style={{
          fontFamily: fonts.SFProRoundedRegular,
          fontSize: 22,
          marginHorizontal: 16,
          color: this.props.color || sharedColors.primaryColor,
        }}
      >
        {this.props.text}
      </Text>
    )
  }
}

@observer
export class EpicProgress extends Component<{
  epic: Tag
  drag?: () => void
}> {
  render() {
    return (
      <TouchableOpacity
        onLongPress={this.props.drag}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 8,
        }}
      >
        <EpicText
          color={this.props.epic.color}
          text={`${this.props.epic.epicPoints}`}
        />
        <View
          style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}
        >
          <EpicText
            color={this.props.epic.color}
            text={`#${this.props.epic.tag}`}
            onPress={() => {
              if (
                sharedAppStateStore.hash.indexOf(`#${this.props.epic.tag}`) < 0
              ) {
                sharedAppStateStore.hash.push(`#${this.props.epic.tag}`)
              }
              navigate('Planning')
            }}
          />
          <ProgressView
            progress={this.props.epic.epicPoints! / this.props.epic.epicGoal!}
            tintColor={this.props.epic.color || sharedColors.primaryColor}
            trackColor={sharedColors.progressBarBackground}
          />
        </View>
        {this.props.epic.epicPoints != this.props.epic.epicGoal ? (
          <EpicText
            color={this.props.epic.color}
            text={`${this.props.epic.epicGoal}`}
          />
        ) : (
          <View style={{ marginRight: 8 }}>
            <IconButton
              onPress={() => {
                sharedTagStore.completeEpic(this.props.epic)
              }}
              color={this.props.epic.color || sharedColors.destructIconColor}
              name="done_outline_28--check"
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }
}
