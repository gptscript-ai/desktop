const separator = '/'

export function join(...parts: string[]) {
  return parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp(`^${  separator }`), '')
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp(`${ separator  }$`), '')
    }

    return part
  }).filter((x) => !!x).join(separator)
}

export function dirname(path: string) {
  const parts = path.split(separator)

  parts.pop()

  return parts.join(separator)
}

export function basename(path: string, removeExt = '') {
  const parts = path.split(separator)

  let name = parts.pop()

  if (removeExt && name?.endsWith(removeExt)) {
    name = name.substring(0, name.length - removeExt.length)
  }

  return name
}
