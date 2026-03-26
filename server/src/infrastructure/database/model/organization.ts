import { find } from '../db_connection'
import { isISOString } from '../../util/date'
import { User } from './user'
import { pageInfoQueries, PageInfoFnQueryArgs, PaginationQueryArgs } from '../util/pagination'
import { PageInfoItem } from '../../util/cursor_connection/cursor_connection'

export type Organization = {
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

export type OrganizationMember = User & { joined_at: Date };

export async function findOrganizationsByLogins(logins: readonly string[]) {
  const query = 'SELECT * FROM organizations WHERE login = ANY($1)'
  const args = [logins]

  const { rows: items } = await find<Readonly<Organization>>(query, args)
  return logins.map(login => (
    items.find(org => org.login === login)
    || new Error(`Organization not found with login: ${login}`)
  ))
}

export async function findOrganizationPeopleByLogin(login: string, pagination: PaginationQueryArgs) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND om.created_at ${pagination.operator} TIMESTAMP WITH TIME ZONE '${pagination.reference}'`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT u.*, om.created_at AS joined_at
      FROM organizations_members om
      JOIN users u ON u.login = om.user_login
      WHERE
        om.organization_login = $1
        ${startFrom}
      ORDER BY om.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY joined_at ASC
  `

  const args = [
    login,
    pagination.limit,
  ]
  const { rows: items } = await find<Readonly<OrganizationMember>>(query, args)

  return items
}

export async function findOrganizationPeoplePageInfo(
  login: string,
  items: OrganizationMember[],
  referenceFrom: (item: OrganizationMember) => string
) {
  const pageInfoFnQuery = (queryArgs: PageInfoFnQueryArgs) => `
    SELECT u.login, '${queryArgs.row}' AS row
    FROM organizations_members om
    JOIN users u ON u.login = om.user_login
    WHERE
      om.organization_login = '${login}'
      and om.created_at ${queryArgs.operator} TIMESTAMP WITH TIME ZONE '${queryArgs.reference}'
    ORDER BY om.created_at ${queryArgs.order}
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