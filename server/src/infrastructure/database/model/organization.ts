import { find } from '../db_connection'
import { handleError } from '../../graphql_server/util/error_handler'
import { isISOString } from '../../util/date'
import { TUser } from './user'
import { pageInfoQueries, TPageInfoFnQueryArgs, TPaginationQueryArgs } from '../util/pagination'
import { TPageInfoItem } from '../../util/cursor_connection/cursor_connection'

export type TOrganization = {
  __typename: 'Organization'
  avatar_url: string
  created_at: Date
  description?: string
  email?: string
  organization_id: string
  location?: string
  login: string
  name?: string
  url: string
  website_url?: string
}

export type TOrganizationMember = TUser & { joined_at: Date };

export async function findOrganizationsByLogins(logins: readonly string[]) {
  const query = 'SELECT *, \'Organization\' __typename FROM organizations WHERE login = ANY($1)'
  const args = [logins]

  try {
    const { rows: items } = await find<Readonly<TOrganization>>(query, args)
    return logins.map(login => (
      items.find(org => org.login === login)
      || new Error(`Organization not found with login: ${login}`)
    ))
  } catch (error) {
    return handleError(error as Error)
  }
}

export async function findOrganizationPeopleByLogin(login: string, pagination: TPaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND users_organizations.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT users.*, users_organizations.created_at AS joined_at
      FROM users_organizations
      JOIN users ON user_login = users.login
      WHERE
        organization_login = $1
        ${startFrom}
      ORDER BY users_organizations.created_at ${pagination.order}
      LIMIT $2
    ) AS users
    ORDER BY users.joined_at ASC
  `

  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<TOrganizationMember>>(query, args)

  return items
}

export async function findOrganizationPeoplePageInfo(
  login: string,
  items: TOrganizationMember[],
  referenceFrom: (item: TOrganizationMember) => string
) {
  const pageInfoFnQuery = (queryArgs: TPageInfoFnQueryArgs) => `
    SELECT users.login, '${queryArgs.row}' AS row
    FROM users_organizations
    JOIN users ON user_login = users.login
    WHERE
      organization_login = '${login}'
      and users_organizations.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY users_organizations.created_at ${queryArgs.order}
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