import { persist } from 'mobx-persist'
import { observable } from 'mobx'

export class Todo {
  @persist @observable text: string
  @persist @observable completed: boolean
  @persist @observable frog: boolean
  @persist @observable frogFails: number
  @persist @observable skipped: boolean
  @persist @observable monthAndYear: string
  @persist @observable date?: string
  @persist @observable time?: string

  constructor(
    text: string,
    completed: boolean,
    frog: boolean,
    frogFails: number,
    skipped: boolean,
    monthAndYear: string,
    date?: string,
    time?: string
  ) {
    this.text = text
    this.completed = completed
    this.frog = frog
    this.frogFails = frogFails
    this.skipped = skipped
    this.monthAndYear = monthAndYear
    this.date = date
    this.time = time
  }
}
