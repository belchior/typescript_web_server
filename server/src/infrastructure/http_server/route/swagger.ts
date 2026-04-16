import { fastifySwagger } from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import envs from '../../util/environment'
import { FastifyTypedInstance } from '../util/types'

export function registerSwaggerRoute(app: FastifyTypedInstance) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'TypeScript Web Server',
        version: '0.1.0',
        description: 'TypeScript Web Server',
      },
      servers: [{ url: envs.SERVER_URL }],
    },
  })

  app.register(fastifySwaggerUi, {
    routePrefix: '/api-docs',
  })
}
