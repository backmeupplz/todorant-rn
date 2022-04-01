import { Component } from 'react'
import { Container, Content } from 'native-base'
import { Divider } from '@components/Divider'
import { RankCard } from '@views/hero/RankCard'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { ranks, sharedHeroStore } from '@stores/HeroStore'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'

@observer
export class HeroProfile extends Component {
  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  @computed get previousRanks() {
    if (sharedHeroStore.rank === -1) {
      return [...ranks].splice(0, ranks.length - 1)
    }
    return ranks.filter((r) => r < sharedHeroStore.rank)
  }

  render() {
    return (
      <Container>
        <Content
          style={{
            backgroundColor: sharedColors.backgroundColor,
            flex: 1,
          }}
        >
          <RankCard
            rank={{
              color: sharedHeroStore.rankColor[0],
              count: sharedHeroStore.rank,
              title: translate(`rank${sharedHeroStore.rank}Title`),
              description: translate(`rank${sharedHeroStore.rank}Description`),
            }}
            progress={sharedHeroStore.progress}
            nextRank={{
              color: sharedHeroStore.colorForRank(
                sharedHeroStore.rankIndex + 1
              )[0],
              count: sharedHeroStore.nextRank,
              title: translate(`rank${sharedHeroStore.nextRank}Title`),
              description: translate(
                `rank${sharedHeroStore.nextRank}Description`
              ),
            }}
          />
          {!!this.previousRanks.length && (
            <>
              <Divider />
              {this.previousRanks
                .map((r, i) => (
                  <RankCard
                    key={i}
                    rank={{
                      color: sharedHeroStore.colorForRank(i)[0],
                      count: r,
                      title: translate(`rank${r}Title`),
                      description: translate(`rank${r}Description`),
                    }}
                    finished
                  />
                ))
                .reverse()}
            </>
          )}
        </Content>
      </Container>
    )
  }
}
