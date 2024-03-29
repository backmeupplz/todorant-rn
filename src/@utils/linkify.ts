import * as url from 'url'
import Linkify from 'linkify-it'

export const linkify = Linkify()
linkify
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  .tlds(require('tlds'))
  .tlds('onion', true)
  .set({ fuzzyIP: true })
  .add('file:', 'http:')
  .add('#', {
    validate: (text, pos) => {
      const tail = text.slice(pos - 1)
      const result = /[\u0400-\u04FFa-zA-Z_0-9]+/.exec(tail)
      return result ? result[0].length : 0
    },
  })

export function l(text: string) {
  const matches = linkify.match(text) || []
  const elements = []
  // No urls
  if (!matches.length) {
    return [
      {
        type: 'text',
        value: text,
      },
    ]
  }
  // Middle ground
  let endIndex = 0
  for (const match of matches) {
    if (endIndex !== match.index) {
      elements.push({
        type: 'text',
        value: text.substr(endIndex, match.index - endIndex),
      })
    }
    const parsedUrl = url.parse(
      text.substr(match.index, match.lastIndex - match.index)
    )
    const isHash = /^#[\u0400-\u04FFa-zA-Z_0-9]+$/u.test(match.url)
    const isText = !isHash && match.url.substr(0, 1) === '#'
    if (!isText) {
      elements.push({
        type: isHash ? 'hash' : 'link',
        url: match.url,
        value: parsedUrl.hostname
          ? `${parsedUrl.hostname}${
              (parsedUrl.pathname || '/').substr(1) || parsedUrl.hash
                ? '/...'
                : ''
            }`
          : parsedUrl.href,
      })
    } else {
      elements.push({
        type: 'text',
        value: match.url,
      })
    }
    endIndex = match.lastIndex
  }
  // Last text
  const lastIndex = matches[matches.length - 1].lastIndex
  elements.push({
    type: 'text',
    value: text.substr(lastIndex, text.length - lastIndex),
  })
  // Respond
  return elements
}
