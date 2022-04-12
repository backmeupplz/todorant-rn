/* eslint-disable @typescript-eslint/ban-types */
import { SyncStage } from '@sync/sockets/SyncStage'

export type PromiseMap = {
  [index: string]: {
    res: Function
    rej: Function
    createdAt: number
    syncStage?: SyncStage
  }
}
