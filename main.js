import 'dotenv/config.js'
import { app } from './src/app.js'
import { createWebSocketServer } from './src/websockets.js'

const port = process.env.APP_PORT

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

createWebSocketServer(server)

const close = () => {
  console.log('Closing application')
  process.exit()
}

process.on('SIGINT', close)
process.on('SIGTERM', close)
