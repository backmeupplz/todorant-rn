import React, { Component } from 'react'
import { Segment, Button, Text } from 'native-base'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'

@observer
export class PlanningHeaderSegment extends Component {
  render() {
    return (
      <Segment>
        <Button
          first
          active={sharedAppStateStore.todoSection === TodoSectionType.planning}
          onPress={() => {
            sharedAppStateStore.todoSection = TodoSectionType.planning
          }}
          style={{
            borderColor: sharedColors.primaryColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.planning
                ? sharedColors.primaryColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.planning
                  ? sharedColors.backgroundColor
                  : sharedColors.primaryColor,
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
            borderColor: sharedColors.primaryColor,
            backgroundColor:
              sharedAppStateStore.todoSection === TodoSectionType.completed
                ? sharedColors.primaryColor
                : sharedColors.backgroundColor,
          }}
        >
          <Text
            style={{
              color:
                sharedAppStateStore.todoSection === TodoSectionType.completed
                  ? sharedColors.backgroundColor
                  : sharedColors.primaryColor,
            }}
          >
            {translate('completed')}
          </Text>
        </Button>
      </Segment>
    )
  }
}
