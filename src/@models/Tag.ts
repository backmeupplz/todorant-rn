import { observable } from 'mobx'

export class Tag {
  static schema = {
    name: 'Tag',
    properties: {
      _tempSyncId: { type: 'string?', indexed: true },
      _id: { type: 'string?', indexed: true },
      createdAt: { type: 'date', indexed: true },
      updatedAt: { type: 'date', indexed: true },
      deleted: { type: 'bool', indexed: true },

      tag: 'string',
      color: 'string?',
    },
  }

  @observable _tempSyncId?: string
  @observable _id?: string
  @observable createdAt = new Date()
  @observable updatedAt = new Date()
  @observable deleted!: boolean

  @observable tag!: string
  @observable color?: string
}