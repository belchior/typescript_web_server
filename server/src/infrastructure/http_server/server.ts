import Fastify, { FastifyInstance } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'

import database from '../database'
import envs from '../util/environment'
import logger from '../util/logger'
import { registerOrganizationRoutes } from './route/organization'
import { registerProfileRoutes } from './route/profile'
import { registerSwaggerRoute } from './route/swagger'
import { registerUserRoutes } from './route/user'

export function createApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.register(fastifyCors, { origin: envs.CLIENT_URL })

  app.register(registerSwaggerRoute)
  app.register(registerProfileRoutes)
  app.register(registerOrganizationRoutes)
  app.register(registerUserRoutes)

  return app
}

async function startServer() {
  await database.dbConnect()

  const server = createApp()

  server.listen({ host: envs.SERVER_HOST, port: envs.SERVER_PORT }, (error) => {
    if (error) {
      logger.error({
        error: {
          message: error.message,
        },
      })
      process.exit(1)
    }
    logger.info({
      message: `Running the server at ${envs.SERVER_URL}`,
    })
    logger.info({
      message: `Swagger is available at ${envs.SERVER_URL}/api-docs`,
    })
    logger.info({
      message: `Accepting requests from ${envs.CLIENT_URL}`,
    })
  })

  return server
}

function addGracefulShutdown(server: FastifyInstance) {
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
    .catch((error) => logger.error({ error: { message: error.message } }))
}
