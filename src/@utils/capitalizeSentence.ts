const regexp = /(:?\.\s?|^)([A-Za-z\u00C0-\u1FFF\u2800-\uFFFD])/gi

export function capitalizeSentence(input: string) {
  return input.replace(regexp, (match) => match.toUpperCase())
}
