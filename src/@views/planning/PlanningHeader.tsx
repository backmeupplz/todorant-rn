import React, { observer } from "mobx-react"
import { Component } from "react"
import { sharedAppStateStore, PlanningMode, TodoSectionType } from "@stores/AppStateStore"
import { sharedColors } from "@utils/sharedColors"
import { translate } from "@utils/i18n"
import { Text, Segment, Button } from "native-base"

@observer
export class PlanningHeader extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>{sharedAppStateStore.hash}</Text>
    ) : sharedAppStateStore.planningMode === PlanningMode.rearrange ? (
      <Text {...sharedColors.textExtraStyle}>{translate('rearrange')}</Text>
    ) : (
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