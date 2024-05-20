export default defineEventHandler(
  async (event) => {
    const body = await readBody(event)

    event.context?.appSocket.emit('message-channel', body.value)

    return body.value
  },
)
