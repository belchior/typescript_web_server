import { FastifyReply } from 'fastify'

import application from '../../../application'
import { CursorConnection } from '../../util/cursor_connection/cursor_connection'
import { errorBody, ErrorBody, ParamsValidationError, QueryValidationError } from '../util/error_handler'
import { Follower, Organization, OrganizationMember, Repository } from '../../database'
import { paramsToOwnerIdentity, queryToPaginationArgs } from '../util/request_validation'
import { FastifyTypedInstance } from '../util/types'

export function registerOrganizationRoutes(app: FastifyTypedInstance) {
  app.get('/organization/:login', async function getOrganization(
    request,
    reply: FastifyReply<{ Reply: Organization | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const organization = await application.organization.findOrganization(login)

      if (organization == null) {
        throw new Error('Not found')
      }
      reply.send(organization)
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

  app.get('/organization/:login/followers', async function getOrganizationFollowers(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<Follower> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const followers = await application.organization.findFollowers(login, pagination)

      reply.send(followers)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })

  app.get('/organization/:login/people', async function getOrganizationMembers(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<OrganizationMember> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const members = await application.organization.findMembers(login, pagination)

      reply.send(members)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })

  app.get('/organization/:login/repositories', async function getOrganizationRepositories(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<Repository> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const repositories = await application.organization.findRepositories(login, pagination)

      reply.send(repositories)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })
}
