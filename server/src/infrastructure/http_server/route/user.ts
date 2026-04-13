import express, { Request, Response } from 'express'

import application, { Follower, Following, User, Repository, StarredRepository, UserOrganization } from '../../../application'
import { CursorConnection } from '../../util/cursor_connection/cursor_connection'
import { ErrorBody, ParamsValidationError, QueryValidationError, responseError } from '../util/error_handler'
import { paramsToOwnerIdentity, queryToPaginationArgs } from '../util/request_validation'

export function registerUserRoutes(app: express.Express) {
  /**
  * @openapi
  * /user/{login}:
  *   get:
  *     description: Gets the User based on provided login
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: An User based on provided login
  *         content:
  *           application/json:
  *             schema:
  *                $ref: "#/components/schemas/User"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  *       "404":
  *         description: The resource was not found, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login', getUser)

  /**
  * @openapi
  * /user/{login}/followers:
  *   get:
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *       - in: query
  *         name: first
  *         description: The number of items to retrieve starting from beginning
  *         schema:
  *           type: number
  *       - in: query
  *         name: after
  *         description: The opaque cursor to advance to the next page
  *         schema:
  *           type: string
  *       - in: query
  *         name: last
  *         description: The number of items to retrieve starting from end
  *         schema:
  *           type: number
  *       - in: query
  *         name: before
  *         description: The opaque cursor to advance to the next page in inverse order
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: Gets a list of people that follow the user
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/FollowerCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login/followers', getUserFollowers)

  /**
  * @openapi
  * /user/{login}/following:
  *   get:
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *       - in: query
  *         name: first
  *         description: The number of items to retrieve starting from beginning
  *         schema:
  *           type: number
  *       - in: query
  *         name: after
  *         description: The opaque cursor to advance to the next page
  *         schema:
  *           type: string
  *       - in: query
  *         name: last
  *         description: The number of items to retrieve starting from end
  *         schema:
  *           type: number
  *       - in: query
  *         name: before
  *         description: The opaque cursor to advance to the next page in inverse order
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: Gets a list of people that follow the user
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/FollowingCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login/following', getUserFollowing)

  /**
  * @openapi
  * /user/{login}/organizations:
  *   get:
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *       - in: query
  *         name: first
  *         description: The number of items to retrieve starting from beginning
  *         schema:
  *           type: number
  *       - in: query
  *         name: after
  *         description: The opaque cursor to advance to the next page
  *         schema:
  *           type: string
  *       - in: query
  *         name: last
  *         description: The number of items to retrieve starting from end
  *         schema:
  *           type: number
  *       - in: query
  *         name: before
  *         description: The opaque cursor to advance to the next page in inverse order
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: Gets a list of organizations that the user is member
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/UserOrganizationCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login/organizations', getUserOrganizations)

  /**
  * @openapi
  * /user/{login}/repositories:
  *   get:
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *       - in: query
  *         name: first
  *         description: The number of items to retrieve starting from beginning
  *         schema:
  *           type: number
  *       - in: query
  *         name: after
  *         description: The opaque cursor to advance to the next page
  *         schema:
  *           type: string
  *       - in: query
  *         name: last
  *         description: The number of items to retrieve starting from end
  *         schema:
  *           type: number
  *       - in: query
  *         name: before
  *         description: The opaque cursor to advance to the next page in inverse order
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: Gets a list of repositories of the user
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/RepositoryCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login/repositories', getUserRepositories)

  /**
  * @openapi
  * /user/{login}/stars:
  *   get:
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
  *       - in: query
  *         name: first
  *         description: The number of items to retrieve starting from beginning
  *         schema:
  *           type: number
  *       - in: query
  *         name: after
  *         description: The opaque cursor to advance to the next page
  *         schema:
  *           type: string
  *       - in: query
  *         name: last
  *         description: The number of items to retrieve starting from end
  *         schema:
  *           type: number
  *       - in: query
  *         name: before
  *         description: The opaque cursor to advance to the next page in inverse order
  *         schema:
  *           type: string
  *     responses:
  *       "200":
  *         description: Gets a list of repositories that the user starred
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/StarredRepositoryCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/user/:login/stars', getStarredRepositories)
}

async function getUser(req: Request, res: Response<User | ErrorBody>) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const user = await application.user.findOneUser(login)

    if (user == null) {
      throw new Error('Not found')
    }
    res.json(user)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    if (error instanceof Error && error.message === 'Not found') {
      responseError({ status: 404, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getUserFollowers(
  req: Request,
  res: Response<CursorConnection<Follower> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const followers = await application.user.findFollowers(login, pagination)

    res.json(followers)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getUserFollowing(
  req: Request,
  res: Response<CursorConnection<Following> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const following = await application.user.findFollowing(login, pagination)

    res.json(following)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getUserOrganizations(
  req: Request,
  res: Response<CursorConnection<UserOrganization> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const orgs = await application.user.findUserOrganizations(login, pagination)

    res.json(orgs)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getUserRepositories(
  req: Request,
  res: Response<CursorConnection<Repository> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const repositories = await application.user.findRepositories(login, pagination)

    res.json(repositories)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getStarredRepositories(
  req: Request,
  res: Response<CursorConnection<StarredRepository> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const stars = await application.user.findStarredRepositories(login, pagination)

    res.json(stars)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}
