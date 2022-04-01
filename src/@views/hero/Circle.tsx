import { Component } from 'react'
import { View } from 'native-base'
import { observer } from 'mobx-react'

@observer
export class Circle extends Component<{
  backgroundColor: string
}> {
  render() {
    return (
      <View
        style={{
          width: 20,
          height: 20,
          borderColor: this.props.backgroundColor,
          borderWidth: 6,
          borderRadius: 10,
        }}
      ></View>
    )
  }
}
