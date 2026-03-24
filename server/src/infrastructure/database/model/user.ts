import { find } from '../db_connection'
import { handleError } from '../../graphql_server/util/error_handler'
import { isISOString } from '../../util/date'
import { TOrganization } from './organization'
import { TPageInfoItem } from '../../util/cursor_connection/cursor_connection'
import { pageInfoQueries, TPageInfoFnQueryArgs, TPaginationQueryArgs } from '../util/pagination'

export type TUser = {
  __typename: 'User'
  avatar_url: string
  bio?: string
  company?: string
  created_at: Date
  email: string
  user_id: string
  location?: string
  login: string
  name?: string
  url: string
  website_url?: string
}

export type TFollower = TUser & { followed_at: Date };
export type TFollowing = TUser & { following_at: Date };
export type TUserOrganization = TOrganization & { joined_at: Date };

export async function findUsersByLogins(logins: readonly string[]) {
  try {
    const query = `
      SELECT *, 'User' __typename
      FROM users 
      WHERE login = ANY($1)
    `
    const args = [logins]
    const { rows: items } = await find<Readonly<TUser>>(query, args)

    const users = logins.map(login => (
      items.find(user => user.login === login)
      || new Error(`User not found with login: ${login}`)
    ))

    return users
  } catch (error) {
    return handleError(error as Error)
  }
}

export async function findFollowersByUserLogin(login: string, pagination: TPaginationQueryArgs) {
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
  const { rows: items } = await find<Readonly<TFollower>>(query, args)

  return items
}

export async function findFollowingByUserLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT u.*, uf.created_at AS following_at
      FROM users u
      INNER JOIN users_following uf ON uf.following_login = u.login
      WHERE
        uf.user_login = $1
        ${startFrom}
      ORDER BY uf.created_at ${pagination.order}
      LIMIT $2
    ) AS users
    ORDER BY following_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<TFollowing>>(query, args)
  return items
}

export async function findOrganizationsByUserLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uo.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT o.*, uo.created_at AS joined_at
      FROM users_organizations uo
      JOIN organizations o ON o.login = uo.organization_login
      WHERE
        uo.user_login = $1
        ${startFrom}
      ORDER BY uo.created_at ${pagination.order}
      LIMIT $2
    ) AS organizations
    ORDER BY joined_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<TUserOrganization>>(query, args)

  return items
}

export async function findFollowersPageInfo(
  login: string,
  items: TFollower[],
  referenceFrom: (item: TFollower) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
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
  const { rows: pageInfoItems } = await find<Readonly<TPageInfoItem>>(query)

  return pageInfoItems
}

export async function findFollowingPageInfo(
  login: string,
  items: TFollowing[],
  referenceFrom: (item: TFollowing) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
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
  const { rows: pageInfoItems } = await find<Readonly<TPageInfoItem>>(query)

  return pageInfoItems
}

export async function findOrganizationsPageInfo(
  login: string,
  items: TUserOrganization[],
  referenceFrom: (item: TUserOrganization) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
    SELECT o.login, '${queryArgs.row}' AS row
    FROM users_organizations uo
    JOIN organizations o ON o.login = uo.organization_login
    WHERE
      uo.user_login = '${login}'
      AND uo.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY uo.created_at ${queryArgs.order}
    LIMIT 1
  `

  const { prevQuery, nextQuery } = pageInfoQueries({ items, pageInfoFnQuery, referenceFrom })
  const query = `
    SELECT * FROM (${prevQuery}) as prev
    UNION
    SELECT * FROM (${nextQuery}) as next
  `
  const { rows: pageInfoItems } = await find<Readonly<TPageInfoItem>>(query)

  return pageInfoItems
}