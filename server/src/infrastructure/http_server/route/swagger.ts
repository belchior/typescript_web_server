import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

import envs from '../../util/environment'

/**
 * @openapi
 *
* components:
*   schemas:
*     ErrorBody:
*       type: object
*       properties:
*         errors:
*           type: array
*           items:
*             type: string
*
*     PageInfo:
*       type: object
*       properties:
*         endCursor:
*           type: string
*         hasPreviousPage:
*           type: boolean
*         hasNextPage:
*           type: boolean
*         startCursor:
*           type: string
*       required:
*         - hasPreviousPage
*         - hasNextPage
*
*     Organization:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         description:
*           type: string
*         email:
*           type: string
*         organization_id:
*           type: string
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*       required:
*         - avatar_url
*         - organization_id
*         - login
*         - url
*
*     User:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         bio:
*           type: string
*         company:
*           type: string
*         email:
*           type: string
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*         user_id:
*           type: string
*         website_url:
*           type: string
*       required:
*         - avatar_url
*         - email
*         - login
*         - url
*         - user_id
*
*     FollowerCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/FollowerEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     FollowerEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/Follower"
*
*     Follower:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         bio:
*           type: string
*         company:
*           type: string
*         email:
*           type: string
*         followed_at:
*           type: string
*           format: date-time
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*         user_id:
*           type: string
*         website_url:
*           type: string
*       required:
*         - avatar_url
*         - email
*         - followed_at
*         - login
*         - url
*         - user_id
*
*     FollowingCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/FollowingEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     FollowingEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/Following"
*
*     Following:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*       required:
*         - avatar_url
*         - login
*         - url
*
*     OrganizationMemberCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/OrganizationMemberEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     OrganizationMemberEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/OrganizationMember"
*
*     OrganizationMember:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         bio:
*           type: string
*         company:
*           type: string
*         email:
*           type: string
*         joined_at:
*           type: string
*           format: date-time
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*         user_id:
*           type: string
*         website_url:
*           type: string
*       required:
*         - avatar_url
*         - email
*         - joined_at
*         - login
*         - url
*         - user_id
*
*     RepositoryCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/RepositoryEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     RepositoryEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/Repository"
*
*     Repository:
*       type: object
*       properties:
*         description:
*           type: string
*         fork_count:
*           type: number
*           format: int
*         star_count:
*           type: number
*           format: int
*         repository_id:
*           type: string
*         name:
*           type: string
*         owner_login:
*           type: string
*         owner_ref:
*           type: string
*         url:
*           type: string
*         language_color:
*           type: string
*         language_name:
*           type: string
*         license_key:
*           type: string
*         license_name:
*           type: string
*       required:
*         - fork_count
*         - star_count
*         - repository_id
*         - name
*         - owner_login
*         - owner_ref
*         - url
*         - language_color
*         - language_name
*         - license_key
*         - license_name
*
*     StarredRepositoryCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/StarredRepositoryEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     StarredRepositoryEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/StarredRepository"
*
*     StarredRepository:
*       type: object
*       properties:
*         description:
*           type: string
*         fork_count:
*           type: number
*           format: int
*         star_count:
*           type: number
*           format: int
*         repository_id:
*           type: string
*         name:
*           type: string
*         owner_login:
*           type: string
*         owner_ref:
*           type: string
*         url:
*           type: string
*         language_color:
*           type: string
*         language_name:
*           type: string
*         license_key:
*           type: string
*         license_name:
*           type: string
*         starred_at:
*           type: string
*           format: date-time
*       required:
*         - fork_count
*         - star_count
*         - repository_id
*         - name
*         - owner_login
*         - owner_ref
*         - url
*         - language_color
*         - language_name
*         - license_key
*         - license_name
*         - starred_at
*
*     UserOrganizationCursor:
*       type: object
*       properties:
*         edges:
*           type: array
*           items:
*             $ref: "#/components/schemas/UserOrganizationEdge"
*         pageInfo:
*           $ref: "#/components/schemas/PageInfo"
*
*     UserOrganizationEdge:
*       type: object
*       properties:
*         cursor:
*           type: string
*         node:
*           $ref: "#/components/schemas/UserOrganization"
*
*     UserOrganization:
*       type: object
*       properties:
*         avatar_url:
*           type: string
*         description:
*           type: string
*         email:
*           type: string
*         joined_at:
*           type: string
*           format: date-time
*         organization_id:
*           type: string
*         location:
*           type: string
*         login:
*           type: string
*         name:
*           type: string
*         url:
*           type: string
*       required:
*         - avatar_url
*         - joined_at
*         - organization_id
*         - login
*         - url
*/

export function registerSwaggerRoute(app: express.Express) {
  const options = {
    failOnErrors: true,
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'TypeScript Web Server',
        version: '0.1.0',
        description: 'TypeScript Web Server',
      },
      servers: [{ url: envs.SERVER_URL }],
      basePath: '/',
    },
    apis: [
      './src/infrastructure/http_server/route/*.ts',
    ],
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)))
}
