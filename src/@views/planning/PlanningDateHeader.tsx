import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { SectionHeaderOrTodo } from '@views/planning/SectionHeaderOrTodo'
import { IconButton } from '@components/IconButton'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import fonts from '@utils/fonts'

@observer
export class PlanningDateHeader extends Component<{
  drag: () => void
  isActive: boolean
  item: SectionHeaderOrTodo
}> {
  render() {
    return (
      <View
        style={{
          marginTop: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onLongPress={
            sharedAppStateStore.todoSection === TodoSectionType.planning
              ? this.props.drag
              : undefined
          }
        >
          <View
            style={{
              backgroundColor: 'rgba(255, 100, 26, 0.06)',
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
            }}
          >
            <Text
              style={{
                color: sharedColors.primaryColor,
                marginVertical: 4,
                marginLeft: this.props.isActive ? 30 : 16,
                marginRight: 12,
                fontFamily: fonts.SFProRoundedRegular,
              }}
            >
              {this.props.item.title}
            </Text>
          </View>
        </TouchableOpacity>
        <IconButton
          onPress={() => {
            navigate('AddTodo', { date: this.props.item.title })
          }}
          size={20}
          name="add_outline_28"
          color={sharedColors.primaryColor}
        />
      </View>
    )
  }
}
