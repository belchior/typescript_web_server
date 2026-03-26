import * as db from '../db_connection'
import { isISOString } from '../../util/date'
import { pageInfoQueries, PageInfoFnQueryArgs, PaginationQueryArgs } from '../util/pagination'
import { Organization } from './organization'
import { PageInfoItem } from '../../util/cursor_connection/cursor_connection'

export type User = {
  avatar_url: string
  bio?: string
  company?: string
  created_at: Date
  email: string
  location?: string
  login: string
  name?: string
  url: string
  user_id: string
  website_url?: string
}

export type Follower = User & { followed_at: Date };
export type UserOrganization = Organization & { joined_at: Date };

export async function findUsersByLogins(logins: readonly string[]) {
  const query = `
      SELECT *
      FROM users 
      WHERE login = ANY($1)
    `
  const args = [logins]
  const { rows: items } = await db.find<Readonly<User>>(query, args)

  const users = logins.map(login => (
    items.find(user => user.login === login)
    || new Error(`User not found with login: ${login}`)
  ))

  return users
}

export async function findFollowersByUserLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT u.*, uf.created_at AS followed_at
      FROM users u
      INNER JOIN users_following uf ON uf.user_login = u.login
      WHERE
        uf.following_login = $1
        ${startFrom}
      ORDER BY uf.created_at ${pagination.order}
      LIMIT $2
    ) AS users
    ORDER BY followed_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await db.find<Readonly<Follower>>(query, args)

  return items
}

export async function findOrganizationsByUserLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND om.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT o.*, om.created_at AS joined_at
      FROM organizations_members om
      JOIN organizations o ON o.login = om.organization_login
      WHERE
        om.user_login = $1
        ${startFrom}
      ORDER BY om.created_at ${pagination.order}
      LIMIT $2
    ) AS organizations
    ORDER BY joined_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await db.find<Readonly<UserOrganization>>(query, args)

  return items
}

export async function findFollowersPageInfo(
  login: string,
  items: Follower[],
  referenceFrom: (item: Follower) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
    SELECT u.login, '${queryArgs.row}' AS row
    FROM users u
    INNER JOIN users_following uf ON uf.following_login = u.login
    WHERE
      uf.user_login = '${login}'
      AND uf.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY uf.created_at ${queryArgs.order}
    LIMIT 1
  `

  const { prevQuery, nextQuery } = pageInfoQueries({ items, pageInfoFnQuery, referenceFrom })
  const query = `
    SELECT * FROM (${prevQuery}) as prev
    UNION
    SELECT * FROM (${nextQuery}) as next
  `
  const { rows: pageInfoItems } = await db.find<Readonly<PageInfoItem>>(query)

  return pageInfoItems
}

export async function findOrganizationsPageInfo(
  login: string,
  items: UserOrganization[],
  referenceFrom: (item: UserOrganization) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
    SELECT o.login, '${queryArgs.row}' AS row
    FROM organizations_members om
    JOIN organizations o ON o.login = om.organization_login
    WHERE
      om.user_login = '${login}'
      AND om.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY om.created_at ${queryArgs.order}
    LIMIT 1
  `

  const { prevQuery, nextQuery } = pageInfoQueries({ items, pageInfoFnQuery, referenceFrom })
  const query = `
    SELECT * FROM (${prevQuery}) as prev
    UNION
    SELECT * FROM (${nextQuery}) as next
  `
  const { rows: pageInfoItems } = await db.find<Readonly<PageInfoItem>>(query)

  return pageInfoItems
}