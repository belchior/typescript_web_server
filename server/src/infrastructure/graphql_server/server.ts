import { Server } from 'node:http'
import cors from 'cors'
import express from 'express'
import pinoHttp from 'pino-http'

import { createGraphqlHandler } from './graphql/handler'
import database from '../database'
import envs from '../util/environment'
import logger, { logConfig } from '../util/logger'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(pinoHttp(logConfig))
  app.use(cors({ methods: 'GET,POST', origin: envs.CLIENT_URL }))
  app.all('/graphql', createGraphqlHandler())

  return app
}

async function startServer() {
  await database.dbConnect()

  const app = createApp()
  const server = app.listen(envs.SERVER_PORT, () => {
    logger.info({
      message: `Running a GraphQL API server at ${envs.SERVER_URL}/graphql`,
    })
    logger.info({
      message: `Accepting requests from ${envs.CLIENT_URL}`,
    })
  })

  return server
}

function addGracefulShutdown(server: Server) {
  const stopServer = async (signal: string) => {
    logger.info({
      message: `Server received a ${signal} signal and will shutdown`,
    })
    server.close(async () => {
      await database.dbDisconnect()

      logger.info({
        message: 'Server shutdown completed',
      })
    })
  }
  process.on('SIGINT', stopServer)
  process.on('SIGTERM', stopServer)
}

if (envs.NODE_ENV !== 'test') {
  startServer()
    .then(addGracefulShutdown)
    .catch(logger.error)
}

