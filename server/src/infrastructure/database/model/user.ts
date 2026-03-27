import { isISOString } from '../../util/date'
import { Organization } from './organization'
import { PageInfoItem } from '../util/types'
import { PaginationQueryArgs } from '../util/pagination'
import * as db from '../db_connection'

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
    ? `AND uf.created_at ${pagination.operator} '${pagination.reference}'::timestamptz`
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
    ? `AND om.created_at ${pagination.operator} '${pagination.reference}'::timestamptz`
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
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query = `
    (
      SELECT u.login, 'prev' AS row
      FROM users u
      INNER JOIN users_following uf ON uf.following_login = u.login
      WHERE
        uf.user_login = $1::varchar
        AND uf.created_at < $2::timestamptz
      ORDER BY uf.created_at DESC
      LIMIT 1
    ) UNION (
      SELECT u.login, 'next' AS row
      FROM users u
      INNER JOIN users_following uf ON uf.following_login = u.login
      WHERE
        uf.user_login = $1::varchar
        AND uf.created_at > $3::timestamptz
      ORDER BY uf.created_at ASC
      LIMIT 1
    )
  `
  const params = [login, referencePrev, referenceNext]
  const { rows } = await db.find<Readonly<PageInfoItem>>(query, params)

  return rows.reduce(
    (acc, item) => {
      if (item.row === 'next') acc.hasNextPage = true
      if (item.row === 'prev') acc.hasPreviousPage = true
      return acc
    },
    { hasNextPage: false, hasPreviousPage: false }
  )
}

export async function findOrganizationsPageInfo(
  login: string,
  items: UserOrganization[],
  referenceFrom: (item: UserOrganization) => string
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query = `
    (
      SELECT o.login, 'prev' AS row
      FROM organizations_members om
      JOIN organizations o ON o.login = om.organization_login
      WHERE
        om.user_login = $1::varchar
        AND om.created_at < $2::timestamptz
      ORDER BY om.created_at DESC
      LIMIT 1
    ) UNION (
      SELECT o.login, 'next' AS row
      FROM organizations_members om
      JOIN organizations o ON o.login = om.organization_login
      WHERE
        om.user_login = $1::varchar
        AND om.created_at > $3::timestamptz
      ORDER BY om.created_at ASC
      LIMIT 1
    )
  `
  const params = [login, referencePrev, referenceNext]
  const { rows } = await db.find<Readonly<PageInfoItem>>(query, params)

  return rows.reduce(
    (acc, item) => {
      if (item.row === 'next') acc.hasNextPage = true
      if (item.row === 'prev') acc.hasPreviousPage = true
      return acc
    },
    { hasNextPage: false, hasPreviousPage: false }
  )
}