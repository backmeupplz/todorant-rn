import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { tableName } from '@nozbe/watermelondb'

export const Tables = {
  tags: tableName<MelonTodo>('tags'),
  todos: tableName<MelonTag>('todos'),
  users: tableName<MelonUser>('users'),
}

export enum TodoColumn {
  _tempSyncId = 'id',
  _exactDate = 'exact_date_at',
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  text = 'text',
  completed = 'is_completed',
  frog = 'is_frog',
  frogFails = 'frog_fails',
  skipped = 'is_skipped',
  order = 'order',
  monthAndYear = 'month_and_year',
  deleted = 'is_deleted',
  encrypted = 'is_encrypted',
  date = 'date',
  time = 'time',
  repetitive = 'is_repetitive',

  user = 'user_id',
  delegator = 'delegator_id',
  delegateAccepted = 'is_delegate_accepted',
}
export enum TagColumn {
  _tempSyncId = 'id',
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  deleted = 'is_deleted',
  tag = 'tag',
  color = 'color',
  numberOfUses = 'number_of_uses',
  epic = 'is_epic',
  epicGoal = 'epic_goal',
  epicCompleted = 'is_epic_completed',
  epicPoints = 'epic_points',
  epicOrder = 'epic_order',
}
export enum UserColumn {
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  name = 'name',
  isDelegator = 'is_delegator',
  deleted = 'is_deleted',
  delegateInviteToken = 'delegate_invite_token',
  todoId = 'todo_id',
}
