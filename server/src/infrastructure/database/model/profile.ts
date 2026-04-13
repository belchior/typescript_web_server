import * as conn from '../db_connection'
import { Follower, User } from './user'
import { isISOString } from '../../util/date'
import { Organization } from './organization'
import { PageInfoItem } from '../util/types'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'

export type ProfileOwner = {
  avatar_url: User['avatar_url'] | Organization['avatar_url']
  location?: User['location'] | Organization['location']
  login: User['login'] | Organization['login']
  name?: User['name'] | Organization['name']
  url: User['url'] | Organization['url']
}

export type Following = ProfileOwner & { following_at: Date };

export async function findFollowersByUserLogin(login: string, args: PaginationArguments) {
  const pagination = paginationArgsToQueryArgs(args)

  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND uf.created_at ${pagination.operator} '${pagination.reference}'::timestamptz`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT u.*, uf.created_at AS followed_at
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.user_login
      LEFT JOIN organizations o ON o.login = uf.user_login
      WHERE
        uf.following_login = $1
        ${startFrom}
      ORDER BY uf.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY followed_at ASC
  `
  const params = [login, pagination.limit]
  const { rows: items } = await conn.find<Readonly<Follower>>(query, params)

  return items
}

export async function findFollowersPageInfo(
  login: string,
  items: Follower[],
  referenceFrom: (_item: Follower) => string
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query = `
    (
      SELECT coalesce(u.login, o.login) login, 'prev' AS row
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.user_login
      LEFT JOIN organizations o ON o.login = uf.user_login
      WHERE
        uf.following_login = $1::varchar
        AND uf.created_at < $2::timestamptz
      ORDER BY uf.created_at DESC
      LIMIT 1
    ) UNION (
      SELECT coalesce(u.login, o.login) login, 'next' AS row
      FROM users_following uf
      LEFT JOIN users u ON u.login = uf.user_login
      LEFT JOIN organizations o ON o.login = uf.user_login
      WHERE
        uf.following_login = $1::varchar
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
