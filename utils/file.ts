interface FileResult {
  name : string
  value: string | ArrayBuffer | null
}

export async function getFileContents(file: File) {
  return new Promise<FileResult>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (ev) => {
      const value = ev.target!.result
      const name = file.name

      resolve({ name, value })
    }

    reader.onerror = (err) => {
      reject(err)
    }

    reader.readAsDataURL(file)
  })
}
