import { isISOString } from '../../util/date'
import { Organization } from './organization'
import { PageInfoItem } from '../util/types'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { User } from './user'
import * as db from '../db_connection'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'

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
  const { rows: items } = await db.find<Readonly<Following>>(query, params)
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