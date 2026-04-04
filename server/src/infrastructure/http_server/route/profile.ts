import express, { Request, Response } from 'express'

import { CursorConnection } from '../../util/cursor_connection/cursor_connection'
import { ErrorBody, ParamsValidationError, QueryValidationError, responseError } from '../util/error_handler'
import { Follower, Organization, Repository, User } from '../../database'
import { paramsToOwnerIdentity, queryToPaginationArgs } from '../util/request_validation'
import application from '../../../application'

export function registerProfileRoutes(app: express.Express) {
  /**
  * @openapi
  * /profile/{login}:
  *   get:
  *     description: Gets an Organization or User based on provided login
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: An Organization or User based on provided login
  *         content:
  *           application/json:
  *             schema:
  *               oneOf:
  *                - $ref: "#/components/schemas/Organization"
  *                - $ref: "#/components/schemas/User"
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
  app.get('/profile/:login', getProfile)

  /**
  * @openapi
  * /profile/{login}/followers:
  *   get:
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: Gets a list of people that follow the profile
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
  app.get('/profile/:login/followers', getProfileFollowers)

  /**
  * @openapi
  * /profile/{login}/repositories:
  *   get:
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: Gets a list of repositories of the profile
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
  app.get('/profile/:login/repositories', getProfileRepositories)
}

async function getProfile(
  req: Request,
  res: Response<User | Organization | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const profile = await application.profile.findProfile(login)

    if (profile == null) {
      throw new Error('Not found')
    }

    res.json(profile)
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

async function getProfileFollowers(
  req: Request,
  res: Response<CursorConnection<Follower> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const followers = await application.profile.findFollowers(login, pagination)

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

async function getProfileRepositories(
  req: Request,
  res: Response<CursorConnection<Repository> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const repositories = await application.profile.findRepositories(login, pagination)

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