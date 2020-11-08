import { SyncStage } from '@utils/sockets/SyncStage'

export type PromiseMap = {
  [index: string]: {
    res: Function
    rej: Function
    createdAt: number
    syncStage?: SyncStage
  }
}
