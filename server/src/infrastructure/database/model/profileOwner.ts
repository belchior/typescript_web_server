import { isISOString } from '../../util/date'
import { pageInfoQueries, PageInfoFnQueryArgs, PaginationQueryArgs } from '../util/pagination'
import { Organization } from './organization'
import { PageInfoItem } from '../../util/cursor_connection/cursor_connection'
import { User } from './user'
import * as db from '../db_connection'

export type ProfileOwner = {
  avatar_url: User['avatar_url'] | Organization['avatar_url']
  location?: User['location'] | Organization['location']
  login: User['login'] | Organization['login']
  name?: User['name'] | Organization['name']
  url: User['url'] | Organization['url']
}
export type Following = ProfileOwner & { following_at: Date };

function profileOwnerColumns() {
  const columns: Array<keyof ProfileOwner> = [
    'avatar_url', 'location', 'login', 'name', 'url',
  ]
  return columns
    .map(column => `coalesce(u.${column}, o.${column}) ${column}`)
    .join(',')
}

export async function findFollowingByLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
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
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await db.find<Readonly<Following>>(query, args)
  return items
}

export async function findFollowingPageInfo(
  login: string,
  items: Following[],
  referenceFrom: (item: Following) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
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
  const { rows: pageInfoItems } = await db.find<Readonly<PageInfoItem>>(query)

  return pageInfoItems
}