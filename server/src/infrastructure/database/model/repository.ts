import { find } from '../db_connection'
import { deserialize } from '../../util/converter'
import { isISOString } from '../../util/date'
import { Organization } from './organization'
import { User } from './user'
import { PageInfoItem } from '../../util/cursor_connection/cursor_connection'
import { pageInfoQueries, PageInfoFnQueryArgs, PaginationQueryArgs } from '../util/pagination'
import { ProfileOwner } from './profileOwner'

export type Repository = {
  created_at: Date
  description?: string
  fork_count: number
  star_count: number
  repository_id: string
  name: string
  owner_login: string
  owner_ref: 'users' | 'organizations'
  primary_language: string
  url: string

  // from table languages
  language_color: string
  language_name: string

  // from table licenses
  license_key: string
  license_name: string
}

export type StarredRepository = Repository & { starred_at: Date }

type OwnerLogin = Repository['owner_login']
type OwnerRef = Repository['owner_ref']

export type ProfileOwnerIdentifier = {
  owner_login: OwnerLogin
  owner_ref: OwnerRef
}

export type RepositoryOwner = ProfileOwner

type RepositoryOwnerLogins = Record<OwnerRef, OwnerLogin[]>

function groupByRef(owners: ProfileOwnerIdentifier[]) {
  const logins: RepositoryOwnerLogins = {
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
  const usersQuery = 'SELECT * FROM users WHERE login = ANY($1)'
  const organizationsQuery = 'SELECT * FROM organizations WHERE login = ANY($1)'

  const owners = serializedOwners.map<ProfileOwnerIdentifier>(deserialize)
  const logins = groupByRef(owners)

  const usersPromise = logins.users.length > 0
    ? find<Readonly<User>>(usersQuery, [logins.users])
    : Promise.resolve({ rows: [] })

  const organiztionsPromise = logins.organizations.length > 0
    ? find<Readonly<Organization>>(organizationsQuery, [logins.organizations])
    : Promise.resolve({ rows: [] })

  const settledResult = await Promise.allSettled([usersPromise, organiztionsPromise])
  const result = fulfilledValues<{ rows: RepositoryOwner[] }>(settledResult)
  const items = result.flatMap(item => item.rows)

  return serializedOwners.map(item => {
    const owner = deserialize<ProfileOwnerIdentifier>(item)
    return (
      items.find(item => item.login === owner.owner_login) ||
      new Error(`Repository Owner not found with login: ${owner.owner_login}`)
    )
  })
}

export async function findRepositoriesByLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND r.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT r.*, la.*, li.*
      FROM repositories r
      LEFT JOIN languages la ON r.primary_language = la.language_name
      LEFT JOIN LATERAL (
        SELECT li.*
        FROM licenses li
        INNER JOIN repositories_licenses rl USING(license_key)
        WHERE rl.repository_id = r.repository_id
        ORDER BY rl.created_at ASC
        LIMIT 1
      ) li on true
      WHERE
        r.owner_login = $1
        ${startFrom}
      ORDER BY r.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY created_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<Repository>>(query, args)

  return items
}

export async function findStarredRepositoriesByLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND rs.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT r.*, rs.created_at AS starred_at
      FROM repositories r
      INNER JOIN repositories_stars rs using(repository_id)
      WHERE
        rs.owner_login = $1
        ${startFrom}
      ORDER BY rs.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY starred_at ASC
  `
  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<StarredRepository>>(query, args)

  return items
}

export async function findRepositoriesPageInfo(
  login: string,
  items: Repository[],
  referenceFrom: (item: Repository) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
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
  const { rows: pageInfoItems } = await find<Readonly<PageInfoItem>>(query)

  return pageInfoItems
}

export async function findStarredRepositoriesPageInfo(
  login: string,
  items: StarredRepository[],
  referenceFrom: (item: StarredRepository) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
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
  const { rows: pageInfoItems } = await find<Readonly<PageInfoItem>>(query)

  return pageInfoItems
}