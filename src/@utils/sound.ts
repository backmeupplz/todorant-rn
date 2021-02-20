import { sharedSettingsStore } from '@stores/SettingsStore'
import Sound from 'react-native-sound'
import { Platform } from 'react-native'

Sound.setMode('Default')
Sound.setCategory('Ambient', true)

const sounds = {} as { [index: string]: Sound }

const iosSounds = {
  level_up: require('@assets/audio/level_up.mp3'),
  nice: require('@assets/audio/nice.mp3'),
  day_complete: require('@assets/audio/day_complete.mp3'),
  task_done: require('@assets/audio/task_done.mp3'),
} as { [index: string]: any }

function getSound(name: string, callback: (error: unknown) => void) {
  return Platform.OS === 'android'
    ? new Sound(`${name}.mp3`, Sound.MAIN_BUNDLE, callback)
    : new Sound(iosSounds[name], callback)
}

const level_up = getSound('level_up', (error) => {
  if (!error) {
    sounds.level_up = level_up
  }
})
const nice = getSound('nice', (error) => {
  if (!error) {
    sounds.nice = nice
  }
})
const day_complete = getSound('day_compele', (error) => {
  if (!error) {
    sounds.day_complete = day_complete
  }
})
const task_done = getSound('task_done.mp3', (error) => {
  if (!error) {
    sounds.task_done = task_done
  }
})

export function playFrogComplete(overrideSound?: string) {
  const shouldBeNice = Math.floor(Math.random() * 10) === 0
  playSound(overrideSound || (shouldBeNice ? 'nice' : 'level_up'))
}

export function playTaskComplete() {
  playSound('task_done')
}

export function playDayComplete() {
  playSound('day_complete')
}

function playSound(name: string) {
  if (!sharedSettingsStore.soundOn && !sharedSettingsStore.endOfDaySoundOn) {
    return
  }
  const sound = sounds[name]
  if (sound) {
    sound.play()
  }
}
