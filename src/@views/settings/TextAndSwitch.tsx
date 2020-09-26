import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TableItem } from '@components/TableItem'
import { Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { Switch } from 'react-native-gesture-handler'
import { Platform } from 'react-native'

@observer
export class TextAndSwitch extends Component<{
  title: string
  value: boolean | undefined
  onValueChange: (value: boolean) => void
}> {
  render() {
    return (
      <TableItem>
        <Text
          style={{
            flex: 1,
            paddingRight: 10,
            ...sharedColors.regularTextExtraStyle.style,
          }}
        >
          {translate(this.props.title)}
        </Text>
        <Switch
          value={this.props.value}
          onValueChange={this.props.onValueChange}
          thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
          trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
        />
      </TableItem>
    )
  }
}
