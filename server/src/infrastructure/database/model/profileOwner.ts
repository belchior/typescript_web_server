import { isISOString } from '../../util/date'
import { pageInfoQueries, TPageInfoFnQueryArgs, TPaginationQueryArgs } from '../util/pagination'
import { TOrganization } from './organization'
import { TPageInfoItem } from '../../util/cursor_connection/cursor_connection'
import { TUser } from './user'
import * as db from '../db_connection'

export type ProfileOwnerType = 'User' | 'Organization'
export type TProfileOwner = {
  __typename: ProfileOwnerType
  avatar_url: TUser['avatar_url'] | TOrganization['avatar_url']
  location?: TUser['location'] | TOrganization['location']
  login: TUser['login'] | TOrganization['login']
  name?: TUser['name'] | TOrganization['name']
  url: TUser['url'] | TOrganization['url']
}
export type TFollowing = TProfileOwner & { following_at: Date };

function profileOwnerColumns() {
  const columns: Array<keyof TProfileOwner> = [
    'avatar_url', 'location', 'login', 'name', 'url',
  ]
  return columns
    .map(column => `coalesce(u.${column}, o.${column}) ${column}`)
    .join(',')
}

export async function findFollowingByLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const ownerColumns = profileOwnerColumns()
  const query = `
    SELECT *
    FROM (
      SELECT 
        uf.created_at AS following_at,
        ${ownerColumns},
        case when u.user_id is not null then 'User' else 'Organization' end __typename 
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
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await db.find<Readonly<TFollowing>>(query, args)
  return items
}

export async function findFollowingPageInfo(
  login: string,
  items: TFollowing[],
  referenceFrom: (item: TFollowing) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
    SELECT coalesce(u.login, o.login) login, '${queryArgs.row}' AS row
    FROM users_following uf
    LEFT JOIN users u ON u.login = uf.following_login
    LEFT JOIN organizations o ON o.login = uf.following_login
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
  const { rows: pageInfoItems } = await db.find<Readonly<TPageInfoItem>>(query)

  return pageInfoItems
}