import React, { Component } from 'react'
import { Tag } from '@models/Tag'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'
import { ProgressView } from '@components/ProgressView'
import { IconButton } from '@components/IconButton'
import { sharedTagStore } from '@stores/TagStore'
import { observer } from 'mobx-react'

@observer
class EpicText extends Component<{
  text: string
  color?: string
}> {
  render() {
    return (
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
}> {
  render() {
    return (
      <View
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
      </View>
    )
  }
}
