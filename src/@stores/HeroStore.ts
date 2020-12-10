import { Hero } from '@models/Hero'
import { hydrate } from '@utils/hydrate'
import { hydrateStore } from '@utils/hydrated'
import { sharedColors } from '@utils/sharedColors'
import { sockets } from '@utils/sockets'
import { computed, observable } from 'mobx'
import { persist } from 'mobx-persist'

export const ranks = [
  0,
  5,
  13,
  42,
  69,
  85,
  100,
  221,
  256,
  300,
  404,
  777,
  800,
  1337,
  1338,
  2048,
  9000,
  12800,
  1000000,
]

class HeroStore {
  hydrated = false

  @persist('date') @observable updatedAt?: Date
  @persist @observable points = 0

  incrementPoints() {
    this.points++
    this.updatedAt = new Date()
    sockets.heroSyncManager.sync()
  }

  @computed get rank() {
    const points = this.points
    let prevRank = 0
    for (const rank of ranks) {
      if (points >= prevRank && points < rank) {
        return prevRank
      }
      prevRank = rank
    }
    return -1
  }

  @computed get nextRank() {
    const points = this.points
    let prevRank = 0
    for (const rank of ranks) {
      if (points >= prevRank && points < rank) {
        return rank
      }
      prevRank = rank
    }
    return -1
  }

  @computed get rankIndex() {
    const points = this.points
    let prevRank = 0
    let result = -1
    ranks.forEach((rank, i) => {
      if (points >= prevRank && points < rank) {
        result = i - 1
      }
      prevRank = rank
    })
    return result
  }

  @computed get rankColor() {
    return this.colorForRank(this.rankIndex)
  }

  colorForRank(rankIndex: number) {
    return rankIndex >= 0
      ? sharedColors.colorSchemes[rankIndex]
      : sharedColors.colorSchemes[sharedColors.colorSchemes.length - 1]
  }

  @computed get progress() {
    return (this.points - this.rank) / (this.nextRank - this.rank)
  }

  onObjectsFromServer = async (
    hero: Hero,
    pushBack: (objects: Hero) => Promise<Hero>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
    }
    // Modify settings
    hero.updatedAt = hero.updatedAt ? new Date(hero.updatedAt) : undefined
    // First pull
    if (!this.updatedAt) {
      this.points = hero.points
      if (hero.updatedAt) {
        this.updatedAt = hero.updatedAt
      } else {
        const pushedHero = await pushBack({
          points: this.points,
        })
        this.points = pushedHero.points
        this.updatedAt = pushedHero.updatedAt
          ? new Date(pushedHero.updatedAt)
          : undefined
      }
    }
    // First push
    else if (!hero.updatedAt) {
      const pushedHero = await pushBack({
        points: this.points,
      })
      this.points = pushedHero.points
      this.updatedAt = pushedHero.updatedAt
        ? new Date(pushedHero.updatedAt)
        : undefined
    }
    // Consequent pull
    else if (this.updatedAt < hero.updatedAt) {
      this.points = hero.points
      this.updatedAt = new Date(hero.updatedAt)
    }
    // Consequent push
    else if (this.updatedAt > hero.updatedAt) {
      const pushedHero = await pushBack({
        points: this.points,
      })
      this.points = pushedHero.points
      this.updatedAt = pushedHero.updatedAt
        ? new Date(pushedHero.updatedAt)
        : undefined
    }
    completeSync()
  }
}

export const sharedHeroStore = new HeroStore()
hydrate('HeroStore', sharedHeroStore).then(async () => {
  sharedHeroStore.hydrated = true
  hydrateStore('HeroStore')
})
