import React, { Component } from 'react'
import { H1, Container, Content, View, Text } from 'native-base'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import { ProgressBar } from '@components/ProgressBar'
import { sharedHeroStore, ranks } from '@stores/HeroStore'
import { ViewStyle } from 'react-native'
import { computed } from 'mobx'

class Box extends Component<{
  style?: ViewStyle
  marginBottomSmall?: boolean
  marginBottomBig?: boolean
  colorScheme?: string[]
}> {
  render() {
    return (
      <View
        style={{
          backgroundColor: (this.props.colorScheme ||
            sharedHeroStore.rankColor)[1],
          padding: 10,
          marginHorizontal: 10,

          borderRadius: 10,
          borderWidth: 0,
          borderColor: 'rgba(255, 255, 255, 0.1)',

          shadowColor: (this.props.colorScheme || sharedHeroStore.rankColor)[1],
          shadowOpacity: 0.6,
          shadowRadius: 5,

          marginBottom: this.props.marginBottomSmall
            ? 10
            : this.props.marginBottomBig
            ? 30
            : undefined,

          ...this.props.style,
        }}
      >
        {this.props.children}
      </View>
    )
  }
}

@observer
export class HeroProfile extends Component {
  @computed get previousRanks() {
    return ranks.filter((r) => r < sharedHeroStore.rank)
  }

  render() {
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedHeroStore.rankColor[3],
            flex: 1,
            paddingTop: 10,
          }}
          contentContainerStyle={{
            alignItems: 'center',
          }}
        >
          <Box marginBottomSmall>
            <Text style={{ color: sharedHeroStore.rankColor[2] }}>
              {translate('rank')}
            </Text>
          </Box>
          <Box marginBottomSmall>
            <H1 style={{ color: sharedHeroStore.rankColor[2] }}>
              {translate(`rank${sharedHeroStore.rank}Title`)}
            </H1>
          </Box>
          <Box marginBottomBig>
            <Text style={{ color: sharedHeroStore.rankColor[2] }}>
              {translate(`rank${sharedHeroStore.rank}Description`)}
            </Text>
          </Box>
          <Box marginBottomSmall>
            <H1 style={{ color: sharedHeroStore.rankColor[2] }}>
              🏅 {sharedHeroStore.points} 🏅
            </H1>
          </Box>
          <Box marginBottomBig>
            <Text style={{ color: sharedHeroStore.rankColor[2] }}>
              {translate(`tasksCompleted`)}
            </Text>
          </Box>
          <Box marginBottomSmall>
            <Text style={{ color: sharedHeroStore.rankColor[2] }}>
              {translate(`pointsTillNextRank`)}{' '}
              {sharedHeroStore.nextRank - sharedHeroStore.points}
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              width: '90%',
              height: 10,
              paddingVertical: 10,
              paddingLeft: 22,
            }}
            marginBottomBig
          >
            <ProgressBar
              progress={sharedHeroStore.progress}
              color={sharedHeroStore.rankColor[2]}
              trackColor={sharedHeroStore.rankColor[3]}
            />
          </Box>
          {!!this.previousRanks.length && (
            <>
              <Box marginBottomSmall>
                <Text style={{ color: sharedHeroStore.rankColor[2] }}>
                  {translate(`achievements`)}
                </Text>
              </Box>
              <View style={{ marginBottom: 20, width: '100%' }}>
                {this.previousRanks
                  .map((r, i) => (
                    <View
                      style={{
                        width: '100%',
                        backgroundColor: sharedHeroStore.colorForRank(i)[3],
                        paddingVertical: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        key={i}
                        colorScheme={sharedHeroStore.colorForRank(i)}
                      >
                        <Text
                          style={{
                            color: sharedHeroStore.colorForRank(i)[2],
                            textAlign: 'center',
                          }}
                        >
                          {r}
                        </Text>
                        <H1
                          style={{
                            color: sharedHeroStore.colorForRank(i)[2],
                            textAlign: 'center',
                          }}
                        >
                          {translate(`rank${r}Title`)}
                        </H1>
                        <Text
                          style={{ color: sharedHeroStore.colorForRank(i)[2] }}
                        >
                          {translate(`rank${r}Description`)}
                        </Text>
                      </Box>
                    </View>
                  ))
                  .reverse()}
              </View>
            </>
          )}
        </Content>
      </Container>
    )
  }
}
