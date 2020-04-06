import React, { Component } from "react"
import { Button, Icon } from "native-base"
import { extraButtonProps } from "@utils/extraButtonProps"
import { sharedColors } from "@utils/sharedColors"
import { observer } from "mobx-react"

export const addButtonStore = {
  add: () => { }
}

@observer
export class AddButton extends Component {
  render() {
    return <Button
      icon
      {...extraButtonProps(sharedColors)}
      style={{
        ...extraButtonProps(sharedColors).style,
        marginHorizontal: -10
      }}
      onPress={() => {
        addButtonStore.add()
      }}
    >
      <Icon
        type="MaterialIcons"
        name="add"
        style={{
          color: sharedColors.textColor
        }}
      />
    </Button>
  }
}