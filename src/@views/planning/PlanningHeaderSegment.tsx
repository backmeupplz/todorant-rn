import React, { Component } from 'react'
import { Button, Segment, Text } from 'native-base'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'

@observer
export class PlanningHeaderSegment extends Component {
  render() {
    return (
      <Segment style={{ opacity: 0.8 }}>
        <Button
          first
          active={sharedAppStateStore.todoSection === TodoSectionType.planning}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.planning
          }}
          style={{
            borderColor: sharedColors.textColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.planning
                ? sharedColors.textColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.planning
                  ? sharedColors.backgroundColor
                  : sharedColors.textColor,
            }}
          >
            {translate('planning')}
          </Text>
        </Button>
        <Button
          transparent
          last
          active={sharedAppStateStore.todoSection === TodoSectionType.completed}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.completed
          }}
          style={{
            borderColor: sharedColors.textColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.completed
                ? sharedColors.textColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.completed
                  ? sharedColors.backgroundColor
                  : sharedColors.textColor,
            }}
          >
            {translate('completed')}
          </Text>
        </Button>
      </Segment>
    )
  }
}
