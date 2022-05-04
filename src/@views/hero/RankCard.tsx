import { Circle } from '@views/hero/Circle'
import { Component } from 'react'
import { Observer, observer } from 'mobx-react'
import { Rank } from '@models/Rank'
import { Text, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { translate } from '@utils/i18n'
import React, { FC, memo } from 'react'
import fonts from '@utils/fonts'

const CircleWithText: FC<{
  color: string
  count: number
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        return (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Circle backgroundColor={props.color} />
            <Text
              style={{
                color: props.color,
                fontFamily: fonts.SFProRoundedBold,
                fontSize: 22,
                marginLeft: 16,
              }}
            >
              {props.count} {translate('points')}
            </Text>
          </View>
        )
      }}
    </Observer>
  )
})

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
            color={this.props.nextRank?.color || 'tomato'}
            count={this.props.nextRank?.count || 0}
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
              backgroundColor: sharedSettingsStore.isDark
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
                bottom: 0,
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
                  fontFamily: fonts.SFProRoundedRegular,
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
                backgroundColor: sharedSettingsStore.isDark
                  ? '#1F1F1F'
                  : '#FFFFFF',
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: sharedSettingsStore.isDark
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
                    fontFamily: fonts.SFProRoundedRegular,
                    color: '#888888',
                  }}
                >
                  {translate('level')} {this.props.rank.count}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: fonts.SFProRoundedRegular,
                  color: sharedColors.textColor,
                }}
              >
                {this.props.rank.title}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.SFProRoundedRegular,
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
            color={this.props.rank.color}
            count={this.props.rank.count}
          />
        )}
      </View>
    )
  }
}
