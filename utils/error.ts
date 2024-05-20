export class LineError extends Error {
  lineNo: number

  constructor(message: string, lineNo: number) {
    super(message)
    this.lineNo = lineNo
  }
}
