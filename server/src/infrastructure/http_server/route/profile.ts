import express, { Request, Response } from 'express'

import application, { Organization, User } from '../../../application'
import { errorBody, ErrorBody, ParamsValidationError } from '../util/error_handler'
import { paramsToOwnerIdentity } from '../util/request_validation'

export function registerProfileRoutes(app: express.Express) {
  /**
  * @openapi
  * /profile/{login}:
  *   get:
  *     description: Gets an Organization or User based on provided login
  *     parameters:
  *       - in: path
  *         name: login
  *         required: true
  *         schema:
  *           type: string
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
      res.status(400).json(errorBody({ error }))
      return
    }

    if (error instanceof Error && error.message === 'Not found') {
      res.status(404).json(errorBody({ error }))
      return
    }

    res.status(500).json(errorBody({ error: error as Error }))
  }
}
