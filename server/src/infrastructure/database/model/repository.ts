import { find } from '../db_connection'
import { handleError } from '../../graphql_server/util/error_handler'
import { deserialize } from '../../util/converter'
import { isISOString } from '../../util/date'
import { TRepositoryOwner } from '../util/types'
import { TOrganization } from './organization'
import { TUser } from './user'
import { TPageInfoItem } from '../../util/cursor_connection/cursor_connection'
import { pageInfoQueries, TPageInfoFnQueryArgs, TPaginationQueryArgs } from '../util/pagination'

export type TOwnerIdentifier = {
  owner_login: string
  owner_ref: 'users' | 'organizations'
}

export type TRepository = {
  __typename: 'Repository'
  created_at: Date
  description?: string
  fork_count: number
  star_count: number
  repository_id: string
  name: string
  owner_login: TOwnerIdentifier['owner_login']
  owner_ref: TOwnerIdentifier['owner_ref']
  primary_language: string
  url: string

  // from table languages
  language_color: string
  language_name: string

  // from table licenses
  license_key: string
  license_name: string
}

export type TStarredRepository = TRepository & { starred_at: Date }

type TKey = TOwnerIdentifier['owner_ref']
type TValue = TOwnerIdentifier['owner_login']
type TRepositoryOwnerLogins = Record<TKey, TValue[]>

function groupByRef(owners: TOwnerIdentifier[]) {
  const logins: TRepositoryOwnerLogins = {
    users: [],
    organizations: [],
  }
  for (const owner of owners) {
    if (Array.isArray(logins[owner.owner_ref])) logins[owner.owner_ref].push(owner.owner_login)
  }
  return logins
}

function fulfilledValues<T>(result: PromiseSettledResult<T>[]): T[] {
  return result
    .filter(item => item.status === 'fulfilled')
    .map(item => item.value)
}

export async function findRepositoryOwners(serializedOwners: readonly string[]) {
  try {
    const usersQuery = 'SELECT *, \'User\' __typename FROM users WHERE login = ANY($1)'
    const organizationsQuery = 'SELECT *, \'Organization\' __typename FROM organizations WHERE login = ANY($1)'

    const owners = serializedOwners.map<TOwnerIdentifier>(deserialize)
    const logins = groupByRef(owners)

    const usersPromise = logins.users.length > 0
      ? find<Readonly<TUser>>(usersQuery, [logins.users])
      : Promise.resolve({ rows: [] })

    const organiztionsPromise = logins.organizations.length > 0
      ? find<Readonly<TOrganization>>(organizationsQuery, [logins.organizations])
      : Promise.resolve({ rows: [] })

    const settledResult = await Promise.allSettled([usersPromise, organiztionsPromise])
    const result = fulfilledValues<{ rows: TRepositoryOwner[] }>(settledResult)
    const items = result.flatMap(item => item.rows)

    return serializedOwners.map(item => {
      const owner = deserialize<TOwnerIdentifier>(item)
      return (
        items.find(item => item.login === owner.owner_login) ||
        new Error(`Repository Owner not found with login: ${owner.owner_login}`)
      )
    })
  } catch (error) {
    return handleError(error as Error)
  }
}

export async function findRepositoryByOwnerLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND r.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT r.*, la.*, li.license_name
      FROM repositories r
      LEFT JOIN languages la on r.primary_language = la.language_name
      LEFT JOIN repositories_licenses rl using(repository_id)
      LEFT JOIN licenses li using(license_key)
      WHERE
        r.owner_login = $1
        ${startFrom}
      ORDER BY r.created_at ${pagination.order}
      LIMIT $2
    ) AS repositories
    ORDER BY created_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<TRepository>>(query, args)

  return items
}

export async function findStarredRepositoryByOwnerLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND rs.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT r.*, rs.created_at AS starred_at
      FROM repositories_stars rs
      JOIN repositories r using(repository_id)
      WHERE
        r.owner_login = $1
        ${startFrom}
      ORDER BY rs.created_at ${pagination.order}
      LIMIT $2
    ) AS repositories
    ORDER BY starred_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<TStarredRepository>>(query, args)

  return items
}

export async function findRepositoryPageInfo(
  login: string,
  items: TRepository[],
  referenceFrom: (item: TRepository) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
    SELECT r.name, '${queryArgs.row}' AS row
    FROM repositories r
    WHERE
      r.owner_login = '${login}'
      AND r.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY r.created_at ${queryArgs.order}
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

export async function findStarredRepositoryPageInfo(
  login: string,
  items: TStarredRepository[],
  referenceFrom: (item: TStarredRepository) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
    SELECT r.name, '${queryArgs.row}' AS row
    FROM repositories_stars rs
    JOIN repositories r using(repository_id)
    WHERE
      rs.owner_login = '${login}'
      AND rs.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY rs.created_at ${queryArgs.order}
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