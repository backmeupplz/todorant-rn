import { sharedSettingsStore } from '@stores/SettingsStore'
import Sound from 'react-native-sound'

Sound.setMode('Default')
Sound.setCategory('Ambient', true)

const sounds = {} as { [index: string]: Sound }

const splat = new Sound('splat.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (!error) {
    sounds.splat = splat
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
  playSound('splat')
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
