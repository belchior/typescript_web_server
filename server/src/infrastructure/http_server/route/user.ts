import { FastifyReply } from 'fastify'

import application from '../../../application'
import { CursorConnection } from '../../util/cursor_connection/cursor_connection'
import { errorBody, ErrorBody, ParamsValidationError, QueryValidationError } from '../util/error_handler'
import { FastifyTypedInstance } from '../util/types'
import { Follower, Following, Repository, StarredRepository, User, UserOrganization } from '../../database'
import { paramsToOwnerIdentity, queryToPaginationArgs } from '../util/request_validation'

export function registerUserRoutes(app: FastifyTypedInstance) {
  app.get('/user/:login', async function getUser(
    request,
    reply: FastifyReply<{ Reply: User | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const user = await application.user.findUser(login)

      if (user == null) {
        throw new Error('Not found')
      }
      reply.send(user)
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

  app.get('/user/:login/followers', async function getUserFollowers(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<Follower> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const followers = await application.user.findFollowers(login, pagination)

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

  app.get('/user/:login/following', async function getUserFollowing(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<Following> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const following = await application.user.findFollowingProfiles(login, pagination)

      reply.send(following)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })

  app.get('/user/:login/organizations', async function getUserOrganizations(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<UserOrganization> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const orgs = await application.user.findUserOrganizations(login, pagination)

      reply.send(orgs)
      return
    } catch (error) {
      if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
        reply.status(400).send(errorBody({ error }))
        return
      }

      reply.status(500).send(errorBody({ error: error as Error }))
    }
  })

  app.get('/user/:login/repositories', async function getUserRepositories(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<Repository> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const repositories = await application.user.findRepositories(login, pagination)

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

  app.get('/user/:login/stars', async function getStarredRepositories(
    request,
    reply: FastifyReply<{ Reply: CursorConnection<StarredRepository> | ErrorBody }>
  ) {
    try {
      const { login } = paramsToOwnerIdentity(request)
      const pagination = queryToPaginationArgs(request.query)
      const stars = await application.user.starredRepositories(login, pagination)

      reply.send(stars)
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
