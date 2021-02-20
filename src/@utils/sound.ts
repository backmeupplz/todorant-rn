import { sharedSettingsStore } from '@stores/SettingsStore'
import Sound from 'react-native-sound'

Sound.setMode('Default')
Sound.setCategory('Ambient', true)

const sounds = {} as { [index: string]: Sound }

const level_up = new Sound(require('@assets/audio/level_up.mp3'), (error) => {
  if (!error) {
    sounds.level_up = level_up
  }
})
const nice = new Sound(require('@assets/audio/nice.mp3'), (error) => {
  if (!error) {
    sounds.nice = nice
  }
})
const day_complete = new Sound(
  require('@assets/audio/day_compele.mp3'),
  (error) => {
    if (!error) {
      sounds.day_complete = day_complete
    }
  }
)
const task_done = new Sound(require('@assets/audio/task_done.mp3'), (error) => {
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
