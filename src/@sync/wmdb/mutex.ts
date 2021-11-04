export class Mutex {
  private static mutex = Promise.resolve()

  private static lock(): PromiseLike<() => void> {
    let begin: (unlock: () => void) => void = (unlock) => {}

    this.mutex = this.mutex.then(() => {
      return new Promise(begin)
    })

    return new Promise((res) => {
      begin = res
    })
  }

  static async dispatch<T>(fn: (() => T) | (() => PromiseLike<T>)): Promise<T> {
    const unlock = await this.lock()
    try {
      return await Promise.resolve(fn())
    } finally {
      unlock()
    }
  }
}
