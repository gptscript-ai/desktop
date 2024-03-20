import markdownIt from 'markdown-it'
import anchorLinks from 'markdown-it-anchor'
import linkAttributes from 'markdown-it-link-attributes'

import hljs from 'highlight.js/lib/core'

import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import dns from 'highlight.js/lib/languages/dns'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import html from 'highlight.js/lib/languages/vbscript-html'
import http from 'highlight.js/lib/languages/http'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import wasm from 'highlight.js/lib/languages/wasm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

import footnotes from './markdown-it-footnote'
import { randomStr } from '@/utils/string'

hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('dns', dns)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('go', go)
hljs.registerLanguage('http', http)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('vbscript-html', html)
hljs.registerLanguage('wasm', wasm)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)

export const md = markdownIt({
  linkify: true,
  breaks:  true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (_) {
      }
    }

    return ''
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

export function renderMarkdown(markdown: string) {
  return `<div class="markdown">${  md.render(markdown, { docId: randomStr() })  }</div>`
}
