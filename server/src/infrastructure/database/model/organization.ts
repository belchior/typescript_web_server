import { find } from '../db_connection'
import { isISOString } from '../../util/date'
import { PageInfoItem } from '../util/types'
import { PaginationQueryArgs } from '../util/pagination'
import { User } from './user'

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

export async function findOrganizationPeopleByLogin(
  login: string,
  pagination: PaginationQueryArgs
) {
  const startFrom = pagination.reference && isISOString(pagination.reference)
    ? `AND om.created_at ${pagination.operator} '${pagination.reference}'::timestamptz`
    : ''

  const query = `
    SELECT *
    FROM (
      SELECT u.*, om.created_at AS joined_at
      FROM users u
      INNER JOIN organizations_members om ON om.user_login = u.login
      WHERE
        om.organization_login = $1
        ${startFrom}
      ORDER BY om.created_at ${pagination.order}
      LIMIT $2
    )
    ORDER BY joined_at ASC
  `

  const params = [login, pagination.limit]
  const { rows: items } = await find<Readonly<OrganizationMember>>(query, params)

  return items
}

export async function findOrganizationPeoplePageInfo(
  login: string,
  items: OrganizationMember[],
  referenceFrom: (item: OrganizationMember) => string
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query = `
    (
      SELECT u.login, 'prev' AS row
      FROM users u
      INNER JOIN organizations_members om ON om.user_login = u.login
      WHERE
        om.organization_login = $1::varchar
        and om.created_at < $2::timestamptz
      ORDER BY om.created_at DESC
      LIMIT 1
    ) UNION (
      SELECT u.login, 'next' AS row
      FROM users u
      INNER JOIN organizations_members om ON om.user_login = u.login
      WHERE
        om.organization_login = $1::varchar
        and om.created_at > $3::timestamptz
      ORDER BY om.created_at ASC
      LIMIT 1
    )
  `
  const params = [login, referencePrev, referenceNext]
  const { rows } = await find<PageInfoItem>(query, params)

  return rows.reduce(
    (acc, item) => {
      if (item.row === 'next') acc.hasNextPage = true
      if (item.row === 'prev') acc.hasPreviousPage = true
      return acc
    },
    { hasNextPage: false, hasPreviousPage: false }
  )
}