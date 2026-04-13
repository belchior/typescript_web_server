import database from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'
import { Follower, OrganizationMember, toFollower, toOrganizationMember, toOrganization, Repository, toRepository } from '../util/converter'

export async function findOneOrganization(login: string) {
  const result = await database.organization.findOneByLogin(login)
  return result != null
    ? toOrganization(result)
    : result
}

export async function findFollowers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Follower) => item.followed_at.toISOString()
  const documents = await database.profileOwner.findFollowersByUserLogin(login, args, 'organizations')

  if (documents.length === 0) return emptyCursorConnection<Follower>()

  const items = documents.map(toFollower)
  const { hasNextPage, hasPreviousPage } = await database.profileOwner.findFollowersPageInfo(
    login,
    items,
    referenceFrom,
    'organizations'
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findMembers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: OrganizationMember) => item.joined_at.toISOString()
  const documents = await database.organization.findOrganizationMembersByLogin(login, args)

  if (documents.length === 0) return emptyCursorConnection<OrganizationMember>()

  const items = documents.map(toOrganizationMember)
  const {
    hasNextPage,
    hasPreviousPage,
  } = await database.organization.findOrganizationMembersPageInfo(
    login,
    items,
    referenceFrom
  )

  return cursorConnection({
    items,
    referenceFrom,
    hasNextPage,
    hasPreviousPage,
  })
}

export async function findRepositories(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Repository) => item.created_at.toISOString()
  const documents = await database.repository.findRepositoriesByLogin(login, args)

  if (documents.length === 0) return emptyCursorConnection<Repository>()

  const items = documents.map(toRepository)
  const { hasNextPage, hasPreviousPage } = await database.repository.findRepositoriesPageInfo(
    login,
    items,
    referenceFrom
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
}
