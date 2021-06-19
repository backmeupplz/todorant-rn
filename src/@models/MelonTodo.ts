import { Model } from '@nozbe/watermelondb'
import { date, field } from '@nozbe/watermelondb/decorators'

export class MelonTodo extends Model {
  static table = 'todos'

  @field('text') text!: string
  @field('month_and_year') monthAndYear: string | undefined
  @field('time') time: string | undefined
  @field('is_frog') frog!: boolean
  @date('exact_date_at') _exactDate: Date | undefined
  @field('is_completed') completed!: boolean
  @field('frog_fails') frogFails!: number
  @field('skipped') skipped!: boolean
  @field('order') order!: number
  @field('is_deleted') deleted!: boolean
  @field('enctypted') encrypted!: boolean
  @field('date') date: string | undefined
}
