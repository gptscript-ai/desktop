import type { Block, Text, Tool } from 'gptstudio'
import { cloneDeep } from 'lodash'
import { LineError } from './error'

interface Context {
  tool:    Partial<Tool>
  text:    Partial<Text>
  content: string[]
  inBody:  boolean
  inText:  boolean
}

const embeddedRegex = /^(#|\/\/)\s?gptscript:(.*)/
const separatorRegex = /^\s*---+\s*$/

export function parse(src: string): Block[] {
  const out: Block[] = []

  let ctx = newContext()
  const lines = src.split(/\r?\n/)

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNo = idx + 1
    let line = `${ lines[idx]  }\n`

    if (!ctx.tool.source) {
      ctx.tool.source = { lineNo: 0 }
    }

    if (!ctx.tool.source.lineNo) {
      ctx.tool.source.lineNo = lineNo
    }

    const match = line.match(embeddedRegex)

    if (match) {
      // Strip special comments to allow embedding the preamble in python or other interpreted languages
      line = match[2].trim()
    }

    if (separatorRegex.test(line)) {
      finishBlock()
      continue
    }

    if (!ctx.inBody) {
      // If the block starts with ! then this is a text block
      if (line.startsWith('!')) {
        ctx.inText = true
        ctx.inBody = true
        ctx.text.format = line.substring(1).trim() || 'markdown'
        continue
      }

      // If the very first line starts with #! just skip because this is a unix interpreter declaration
      if (line.startsWith('#!') && lineNo === 1) {
        ctx.tool.hashbang = line
        continue
      }

      // This is a comment, and should probably be preserved someday
      if (line.startsWith('#') && !line.startsWith('#!')) {
        continue
      }

      // Blank length
      if (line.trim() === '') {
        continue
      }

      // Look for params
      const ok = applyParam(line, lineNo, ctx.tool as Tool)

      if (ok) {
        continue
      }
    }

    ctx.inBody = true
    ctx.content.push(line)
  }

  finishBlock()

  function finishBlock() {
    const content = ctx.content.join('') // Lines already have a newline in them

    if (ctx.inText) {
      if (content) {
        ctx.text.id = randomStr()
        ctx.text.content = content.trim()
        out.push(ctx.text as Text)
        ctx = newContext()
      }
    } else if (content || ctx.tool.name || ctx.tool.export?.length || ctx.tool.tools?.length) {
      ctx.tool.id = randomStr()
      ctx.tool.instructions = content.trim()
      out.push(ctx.tool as Tool)
      ctx = newContext()
    }
  }

  return out
}

function newContext(): Context {
  return {
    tool:    { type: 'tool', source: { lineNo: 0 } },
    text:    { type: 'text', format: '', content: '' },
    content: [],
    inBody:  false,
    inText:  false,
  }
}

function toBool(value: string, lineNo: number) {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    throw new LineError(`Invalid boolean parameter, must be "true" or "false", got "${ value }"`, lineNo)
  }
}

function fromCSV(value: string): string[] {
  return (value || '').split(/,/).map((x) => x.trim())
}

function addArg(line: string, lineNo: number, tool: Partial<Tool>) {
  if (!tool.arguments) {
    tool.arguments = {
      type:       'object',
      properties: {},
    }
  }

  if (!tool.arguments.properties) {
    tool.arguments.properties = {}
  }

  const idx = line.indexOf(':')

  if (idx <= 0) {
    throw new LineError(`Invalid arg format: ${ line }`, lineNo)
  }

  const key = line.substring(0, idx)
  const value = line.substring(idx + 1)

  tool.arguments.properties[key] = {
    type:        'string',
    description: value.trim(),
  }
}

function applyParam(line: string, lineNo: number, tool: Partial<Tool>): boolean {
  const idx = line.indexOf(':')

  if (idx < 0) {
    return false
  }

  const key = line.substring(0, idx).toLowerCase().replace(/ /g, '')
  const value = line.substring(idx + 1).trim()
  const asInt = Number.parseInt(value, 10)
  const asFloat = Number.parseFloat(value)

  switch (key) {
    case 'name':
      tool.name = value.toLowerCase()

      return true

    case 'modelprovider':
      tool.modelProvider = true

      return true

    case 'model':
    case 'modelname':
      tool.modelName = value

      return true

    case 'description':
      tool.description = value

      return true

    case 'internalprompt':
      tool.internalPrompt = toBool(value, lineNo)

      return true

    case 'export':
      if (!tool.export) {
        tool.export = []
      }

      tool.export.push(...fromCSV(value.toLowerCase()))

      return true

    case 'tool':
    case 'tools':
      if (!tool.tools) {
        tool.tools = []
      }

      tool.tools.push(...fromCSV(value.toLowerCase()))

      return true

    case 'globaltool':
    case 'globaltools':
      if (!tool.globalTools) {
        tool.globalTools = []
      }

      tool.globalTools.push(...value.split(/\s*,\s*/).filter((x) => !!x))

      return true

    case 'arg':
    case 'args':
    case 'param':
    case 'params':
    case 'parameters':
    case 'parameter':
      addArg(value, lineNo, tool)

      return true

    case 'maxtoken':
    case 'maxtokens':
      if (Number.isNaN(asInt) || asInt < 0) {
        throw new LineError(`Invalid maxTokens value: ${ value }`, lineNo)
      }

      tool.maxTokens = asInt

      return true

    case 'cache':
      tool.cache = toBool(value, lineNo)

      return true

    case 'jsonmode':
    case 'json':
    case 'jsonoutput':
    case 'jsonformat':
    case 'jsonresponse':
      tool.jsonResponse = toBool(value, lineNo)

      return true

    case 'temperature':
      if (Number.isNaN(asFloat) || asFloat < 0) {
        throw new LineError(`Invalid temperature value: ${ value }`, lineNo)
      }

      tool.temperature = asFloat

      return true
  }

  return false
}

export function stringifyText(t: Text): string {
  return `!${ t.format || 'markdown' }\n\n${ t.content.trim() }`
}

export function stringifyTool(t: Tool, includeName = true, includeGlobalTools = true): string {
  const out = []

  includeName && t.name && out.push(`Name: ${ t.name.trim() }`)
  t.description && out.push(`Description: ${ t.description.trim() }`)
  includeGlobalTools && t.globalTools?.length && out.push(`Global Tools: ${ t.globalTools.join(', ') }`)
  t.tools?.length && out.push(`Tools: ${ t.tools.join(', ') }`)
  t.maxTokens && out.push(`Max Tokens: ${ t.maxTokens }`)
  t.modelName && out.push(`Model: ${ t.modelName }`)
  t.cache === false && out.push('Cache: false')
  t.internalPrompt === false && out.push(`Internal Prompt: false`)
  t.jsonResponse && out.push('JSON Response: true');
  (t.temperature >= 0) && out.push(`Temperature: ${ t.temperature }`)

  Object.entries(t.arguments?.properties || {}).forEach(([arg, desc]) => {
    out.push(`Arg: ${ arg }: ${ desc.description || 'No description' }`)
  })

  if (t.hashbang) {
    out.push(t.hashbang)
    out.push('')
  }

  if (t.instructions) {
    out.push('')
    out.push(t.instructions)
  }

  return out.join('\n').trim()
}

export function stringifyBlock(b: Text | Tool) {
  if (b.type === 'text') {
    return stringifyText(b)
  } else {
    return stringifyTool(b)
  }
}

export function stringifyProgram(blocks: Block[]) {
  // let out = blocks.map((b) => stringifyBlock(b)).join('\n\n---\n')
  let out = blocks.filter((b) => {
    if (b.type === 'text' && !b.content.trim().length) {
      return false
    }

    if (b.type === 'tool' && !b.instructions.trim().length) {
      return false
    }

    return true
  }).map((b) => stringifyBlock(b)).join('\n\n---\n')

  out += '\n'

  return out
}

export function simplifyTool(t: Tool): Tool {
  const out = cloneDeep(t) as Partial<Tool>

  if (!out.name) {
    delete out.name
  }

  if (!out.description) {
    delete out.description
  }

  if (!out.tools?.length) {
    delete out.tools
  }

  if (!out.maxTokens) {
    delete out.maxTokens
  }

  if (!out.modelName) {
    delete out.modelName
  }

  if (out.cache) {
    delete out.cache
  }

  if (out.internalPrompt) {
    delete out.internalPrompt
  }

  if (!out.jsonResponse) {
    delete out.jsonResponse
  }

  if (!out.temperature) {
    delete out.temperature
  }

  if (out.arguments) {
    let all = true

    if (Object.keys(out.arguments?.properties || {}).length) {
      all = false
    } else {
      delete out.arguments?.properties
    }

    if (out.arguments?.required?.length) {
      all = false
    } else {
      delete out.arguments.required
    }

    if (all) {
      delete out.arguments
    }
  }

  if (!out.instructions) {
    out.instructions = ''
  }

  return out as Tool
}
