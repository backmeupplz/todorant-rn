import { Component } from 'react'
import { Icon, View } from 'native-base'
import { MelonTodo } from '@models/MelonTodo'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'

@observer
export class TodoCardBackground extends Component<{
  direction: string
  todo: MelonTodo
}> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems:
            this.props.direction === 'left' ? 'flex-start' : 'flex-end',
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <Icon
          type="MaterialIcons"
          name={this.props.direction === 'left' ? 'done' : 'delete'}
          {...sharedColors.iconExtraStyle}
          style={{ color: 'white' }}
        />
      </View>
    )
  }
}
