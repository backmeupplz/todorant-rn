import React, { Component } from 'react'
import { View, Text } from 'native-base'
import { Circle } from '@views/hero/Circle'
import { Rank } from '@models/Rank'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { sharedHeroStore } from '@stores/HeroStore'

@observer
class CircleWithText extends Component<{
  color: string
  count: number
}> {
  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Circle backgroundColor={this.props.color} />
        <Text
          style={{
            color: this.props.color,
            fontFamily: 'SF-Pro-Rounded-Bold',
            fontSize: 22,
            marginLeft: 16,
          }}
        >
          {this.props.count} {translate('points')}
        </Text>
      </View>
    )
  }
}

@observer
export class RankCard extends Component<{
  rank: Rank
  nextRank?: Rank
  finished?: boolean
  progress?: number
}> {
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          width: '100%',
          padding: 16,
        }}
      >
        {!this.props.finished && (
          <CircleWithText
            color={this.props.rank.color}
            count={this.props.rank.count}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 8,
            paddingRight: 16,
          }}
        >
          <View
            style={{
              width: 2,
              height: '100%',
              backgroundColor: sharedColors.isDark
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
              marginHorizontal: 9,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                backgroundColor: this.props.rank.color,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height:
                  this.props.progress === undefined
                    ? '100%'
                    : `${this.props.progress * 100}%`,
                borderRadius: 10,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'column',
              paddingLeft: 16,
            }}
          >
            {!this.props.finished && (
              <Text
                style={{
                  fontFamily: 'SF-Pro-Rounded-Regular',
                  fontSize: 15,
                  color: '#888888',
                }}
              >
                {(this.props.nextRank?.count || 0) - sharedHeroStore.points}{' '}
                {translate('pointsTillNextLevel')}
              </Text>
            )}
            <View
              style={{
                backgroundColor: sharedColors.isDark ? '#1F1F1F' : '#FFFFFF',
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: sharedColors.isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.01)',
                elevation: 1,
                marginVertical: 8,
                marginRight: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: 'SF-Pro-Rounded-Regular',
                    color: '#888888',
                  }}
                >
                  {translate('level')} {this.props.rank.count}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'SF-Pro-Rounded-Regular',
                  color: sharedColors.textColor,
                }}
              >
                {this.props.rank.title}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'SF-Pro-Rounded-Regular',
                fontSize: 15,
                color: '#888888',
              }}
            >
              {this.props.rank.description}
            </Text>
          </View>
        </View>
        {!this.props.finished && (
          <CircleWithText
            color={this.props.nextRank?.color || 'tomato'}
            count={this.props.nextRank?.count || 0}
          />
        )}
      </View>
    )
  }
}
