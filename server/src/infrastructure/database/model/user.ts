import { Following, ProfileOwner } from './profileOwner'
import { isISOString } from '../../util/date'
import { Organization } from './organization'
import { PageInfoItem } from '../util/types'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import * as conn from '../db_connection'

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
  const { rows: items } = await conn.find<Readonly<User>>(query, args)

  const users = logins.map(login => (
    items.find(user => user.login === login)
    || new Error(`User not found with login: ${login}`)
  ))

  return users
}

function profileOwnerColumns() {
  const columns: Array<keyof ProfileOwner> = [
    'avatar_url', 'location', 'login', 'name', 'url',
  ]
  return columns
    .map(column => `coalesce(u.${column}, o.${column}) ${column}`)
    .join(',')
}

export async function findFollowingByLogin(login: string, args: PaginationArguments) {
  const pagination = paginationArgsToQueryArgs(args)

  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} '${pagination.reference}'::timestamptz`
    : ''

  const ownerColumns = profileOwnerColumns()
  const query = `
    SELECT *
    FROM (
      SELECT 
        uf.created_at AS following_at,
        ${ownerColumns}
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.following_login
      LEFT JOIN organizations o ON o.login = uf.following_login
      WHERE
        uf.user_login = $1
        ${startFrom}
      ORDER BY uf.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY following_at ASC
  `
  const params = [login, pagination.limit]
  const { rows: items } = await conn.find<Readonly<Following>>(query, params)
  return items
}

export async function findFollowingPageInfo(
  login: string,
  items: Following[],
  referenceFrom: (item: Following) => string
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query = `
    (
      SELECT coalesce(u.login, o.login) login, 'prev' AS row
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.following_login
      LEFT JOIN organizations o ON o.login = uf.following_login
      WHERE
        uf.user_login = $1::varchar
        AND uf.created_at < $2::timestamptz
      ORDER BY uf.created_at DESC
      LIMIT 1
    ) UNION (
      SELECT coalesce(u.login, o.login) login, 'next' AS row
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.following_login
      LEFT JOIN organizations o ON o.login = uf.following_login
      WHERE
        uf.user_login = $1::varchar
        AND uf.created_at > $3::timestamptz
      ORDER BY uf.created_at ASC
      LIMIT 1
    )
  `
  const params = [login, referencePrev, referenceNext]
  const { rows } = await conn.find<Readonly<PageInfoItem>>(query, params)

  return rows.reduce(
    (acc, item) => {
      if (item.row === 'next') acc.hasNextPage = true
      if (item.row === 'prev') acc.hasPreviousPage = true
      return acc
    },
    { hasNextPage: false, hasPreviousPage: false }
  )
}

export async function findUserOrganizationsByLogin(login: string, args: PaginationArguments) {
  const pagination = paginationArgsToQueryArgs(args)

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
    )
    ORDER BY joined_at ASC
  `
  const params = [login, pagination.limit]
  const { rows: items } = await conn.find<Readonly<UserOrganization>>(query, params)

  return items
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
  const { rows } = await conn.find<Readonly<PageInfoItem>>(query, params)

  return rows.reduce(
    (acc, item) => {
      if (item.row === 'next') acc.hasNextPage = true
      if (item.row === 'prev') acc.hasPreviousPage = true
      return acc
    },
    { hasNextPage: false, hasPreviousPage: false }
  )
}