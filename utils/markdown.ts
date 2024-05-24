import markdownIt from 'markdown-it'
import anchorLinks from 'markdown-it-anchor'
import linkAttributes from 'markdown-it-link-attributes'
import { highlight, supports } from './highlight'
import footnotes from './markdown-it-footnote'
import { randomStr } from './string'

export const md = markdownIt({
  linkify: true,
  breaks:  true,
  highlight(str: string, lang: string) {
    if (lang && supports(lang)) {
      try {
        return highlight(str, lang)
      } catch (e) {
        console.error('Error highlighting', e)
      }
    }

    return str
  },
})

md.use(linkAttributes, {
  attrs: {
    target: '_blank',
    rel:    'noopener noreferrer nofollow',
  },
})

md.use(anchorLinks)
md.use(footnotes)

export function renderMarkdown(markdown: string, docId?: string, tag="span") {
  if (!docId) {
    docId = randomStr()
  }

  return `<${tag} class="markdown">${  md.render(markdown, { docId })  }</${tag}>`
}
