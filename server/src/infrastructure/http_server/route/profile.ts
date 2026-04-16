import { FastifyReply } from 'fastify'

import application from '../../../application'
import { errorBody, ErrorBody, ParamsValidationError } from '../util/error_handler'
import { FastifyTypedInstance } from '../util/types'
import { Organization, User } from '../../database'
import { paramsToOwnerIdentity } from '../util/request_validation'

export function registerProfileRoutes(app: FastifyTypedInstance) {
  app.get('/profile/:login', async function getProfile(
    request,
    reply: FastifyReply<{ Reply: Organization | User | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const profile = await application.profile.findProfile(login)

      if (profile == null) {
        throw new Error('Not found')
      }

      reply.send(profile)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      if (error instanceof Error && error.message === 'Not found') {
        reply.status(404).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })
}
