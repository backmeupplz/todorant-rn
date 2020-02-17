import { persist } from 'mobx-persist'
import { observable } from 'mobx'

export class Todo {
  @persist @observable _id?: string
  @persist('date' as any) @observable createdAt: Date
  @persist('date' as any) @observable updatedAt: Date
  @persist @observable text: string
  @persist @observable completed: boolean
  @persist @observable frog: boolean
  @persist @observable frogFails: number
  @persist @observable skipped: boolean
  @persist @observable order: number
  @persist @observable monthAndYear: string
  @persist @observable date?: string
  @persist @observable time?: string

  // Temp value
  _tempSyncId?: string

  constructor(
    createdAt: Date,
    updatedAt: Date,
    text: string,
    completed: boolean,
    frog: boolean,
    frogFails: number,
    skipped: boolean,
    order: number,
    monthAndYear: string,
    date?: string,
    time?: string
  ) {
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.text = text
    this.completed = completed
    this.frog = frog
    this.frogFails = frogFails
    this.skipped = skipped
    this.order = order
    this.monthAndYear = monthAndYear
    this.date = date
    this.time = time
  }
}
