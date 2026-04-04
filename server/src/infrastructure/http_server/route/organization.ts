import express, { Request, Response } from 'express'

import { CursorConnection } from '../../util/cursor_connection/cursor_connection'
import { ErrorBody, ParamsValidationError, QueryValidationError, responseError } from '../util/error_handler'
import { Follower, Organization, OrganizationMember, Repository } from '../../database'
import { paramsToOwnerIdentity, queryToPaginationArgs } from '../util/request_validation'
import application from '../../../application'

export function registerOrganizationRoutes(app: express.Express) {
  /**
  * @openapi
  * /organization/{login}:
  *   get:
  *     description: Gets an Organization based on provided login
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: The organization data
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/Organization"
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
  app.get('/organization/:login', getOrganization)

  /**
  * @openapi
  * /organization/{login}/followers:
  *   get:
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: Gets a list of people that follow the Organization
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
  app.get('/organization/:login/followers', getOrganizationFollowers)

  /**
  * @openapi
  * /organization/{login}/people:
  *   get:
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: Gets a list of members of the organization
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/OrganizationMemberCursor"
  *       "400":
  *         description: The login parameter is invalid, the error payload contains a list of error messages
  *         content:
  *           application/json:
  *             schema:
  *               $ref: "#/components/schemas/ErrorBody"
  */
  app.get('/organization/:login/people', getOrganizationMembers)

  /**
  * @openapi
  * /organization/{login}/repositories:
  *   get:
  *     parameters:
  *       - name: login
  *         in: path
  *         required: true
  *         schema:
  *         type: string
  *     responses:
  *       "200":
  *         description: Gets a list of repositories of the organization
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
  app.get('/organization/:login/repositories', getOrganizationRepositories)
}

async function getOrganization(
  req: Request,
  res: Response<Organization | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const organization = await application.organization.findOrganization(login)

    if (organization == null) {
      throw new Error('Not found')
    }
    res.json(organization)
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

async function getOrganizationFollowers(
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

async function getOrganizationMembers(
  req: Request,
  res: Response<CursorConnection<OrganizationMember> | ErrorBody>
) {
  try {
    const { login } = paramsToOwnerIdentity(req.params)
    const pagination = queryToPaginationArgs(req.query)
    const members = await application.organization.findMembers(login, pagination)

    res.json(members)
    return
  } catch (error) {
    if (error instanceof ParamsValidationError || error instanceof QueryValidationError) {
      responseError({ status: 400, res, error })
      return
    }

    responseError({ res, error: error as Error })
  }
}

async function getOrganizationRepositories(
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
