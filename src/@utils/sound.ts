import { sharedSettingsStore } from '@stores/SettingsStore'
import Sound from 'react-native-sound'

Sound.setMode('Default')
Sound.setCategory('Ambient', true)

const sounds = {} as { [index: string]: Sound }

const level_up = new Sound('level_up.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {
    sounds.level_up = level_up
  }
})
const nice = new Sound('nice.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {
    sounds.nice = nice
  }
})
const day_complete = new Sound(
  'day_compele.mp3',
  Sound.MAIN_BUNDLE,
  (error) => {
    if (!error) {
      sounds.day_complete = day_complete
    }
  }
)
const task_done = new Sound('task_done.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {
    sounds.task_done = task_done
  }
})

export function playFrogComplete() {
  const shouldBeNice = Math.floor(Math.random() * 10) === 0
  playSound(shouldBeNice ? 'nice' : 'level_up')
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
