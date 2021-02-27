import { sharedSettingsStore } from '@stores/SettingsStore'
import Sound from 'react-native-sound'
import { Platform } from 'react-native'

Sound.setMode('Default')
Sound.setCategory('Ambient', true)

const sounds = {} as { [index: string]: Sound }

const level_up =
  Platform.OS === 'android'
    ? new Sound('level_up.mp3', Sound.MAIN_BUNDLE, setLevelUp)
    : new Sound(require('@assets/audio/level_up.mp3'), setLevelUp)
function setLevelUp(error: any) {
  if (!error) {
    sounds.level_up = level_up
  }
}

const nice =
  Platform.OS === 'android'
    ? new Sound('nice.mp3', Sound.MAIN_BUNDLE, setNice)
    : new Sound(require('@assets/audio/nice.mp3'), setNice)
function setNice(error: any) {
  if (!error) {
    sounds.nice = nice
  }
}

const day_complete =
  Platform.OS === 'android'
    ? new Sound('day_compele.mp3', Sound.MAIN_BUNDLE, setDayComplete)
    : new Sound(require('@assets/audio/day_compele.mp3'), setDayComplete)
function setDayComplete(error: any) {
  if (!error) {
    sounds.day_complete = day_complete
  }
}

const task_done =
  Platform.OS === 'android'
    ? new Sound('task_done.mp3', Sound.MAIN_BUNDLE, setTaskDone)
    : new Sound(require('@assets/audio/task_done.mp3'), setTaskDone)
function setTaskDone(error: any) {
  if (!error) {
    sounds.task_done = task_done
  }
}

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
