const nonLikeSafeRegexp = /[^а-яА-Яa-zA-Z0-9]/g

export function sanitizeLikeString(value: string): string {
  if (typeof value !== 'string') {
    const errText = 'Value passed to Q.sanitizeLikeString() is not a string'
    console.error(errText)
    throw new Error(errText)
  }
  return value.replace(nonLikeSafeRegexp, '_')
}
