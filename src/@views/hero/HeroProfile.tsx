import React, { Component } from 'react'
import { H1, Container, Content, View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { realm } from '@utils/realm'
import { Todo } from '@models/Todo'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { getDateString } from '@utils/time'
import { ProgressBar } from '@components/ProgressBar'

const ranks = [
  0,
  69,
  100,
  200,
  400,
  420,
  777,
  800,
  1600,
  3200,
  6400,
  12800,
  25600,
]

@observer
export class HeroProfile extends Component {
  @observable contributions = [] as Array<{ date: string }>
  @observable points = 10

  componentDidMount() {
    const hundredDaysAgo = new Date()
    hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100)
    this.contributions = Array.from(
      realm
        .objects<Todo>(Todo)
        .filtered(
          `deleted = false && completed = true && _exactDate > ${realmTimestampFromDate(
            hundredDaysAgo
          )}`
        )
    ).map((todo) => ({ date: getDateString(todo._exactDate) }))
    this.forceUpdate()
  }

  get rank() {
    let prevRank = 0
    for (const rank of ranks) {
      if (this.points > prevRank && this.points < rank) {
        return prevRank
      }
    }
    return -1
  }

  get nextRank() {
    let prevRank = 0
    for (const rank of ranks) {
      if (this.points > prevRank && this.points < rank) {
        return rank
      }
    }
    return -1
  }

  render() {
    return (
      <Container>
        <Content
          style={{ backgroundColor: sharedColors.backgroundColor, padding: 12 }}
        >
          <View
            style={{
              alignItems: 'center',
              flex: 1,
            }}
          >
            <H1
              style={{
                ...sharedColors.textExtraStyle.style,
                marginBottom: 20,
              }}
            >
              {translate('rank')}
            </H1>
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
              }}
            >
              {translate(`rank${this.rank}Title`)}
            </Text>
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
                marginBottom: 20,
              }}
            >
              {translate(`rank${this.rank}Description`)}
            </Text>
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
              }}
            >
              {translate(`tasksCompleted`)} {this.points}
            </Text>
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
              }}
            >
              {translate(`pointsTillNextRank`)} {this.nextRank - this.points}
            </Text>
            <View
              style={{
                flex: 1,
                width: '100%',
                height: 10,
                marginTop: 20,
              }}
            >
              <ProgressBar
                progress={
                  (this.points - this.rank) / (this.nextRank - this.rank)
                }
              />
            </View>
          </View>
        </Content>
      </Container>
    )
  }
}
