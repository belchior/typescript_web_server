import database from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'
import {
  Follower,
  Following,
  StarredRepository,
  toFollower,
  toFollowing,
  toStarredRepository,
  toUserOrganization,
  toUser,
  UserOrganization,
  Repository,
  toRepository,
} from '../util/converter'

export async function findOneUser(login: string) {
  const result = await database.user.findOneByLogin(login)
  return result != null
    ? toUser(result)
    : result
}

export async function findFollowers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Follower) => item.followed_at.toISOString()
  const documents = await database.profileOwner.findFollowersByUserLogin(login, args, 'users')

  if (documents.length === 0) return emptyCursorConnection<Follower>()

  const items = documents.map(toFollower)
  const { hasNextPage, hasPreviousPage } = await database.profileOwner.findFollowersPageInfo(
    login,
    items,
    referenceFrom,
    'users'
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findFollowing(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Following) => item.following_at.toISOString()
  const documents = await database.user.findFollowingByLogin(login, args)

  if (documents.length === 0) return emptyCursorConnection<Following>()

  const items = documents.map(toFollowing)
  const { hasNextPage, hasPreviousPage } = await database.user.findFollowingPageInfo(
    login,
    items,
    referenceFrom
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findUserOrganizations(login: string, args: PaginationArguments) {
  const referenceFrom = (item: UserOrganization) => item.joined_at.toISOString()
  const documents = await database.user.findUserOrganizationsByLogin(login, args)

  if (documents.length === 0) return emptyCursorConnection<UserOrganization>()

  const items = documents.map(toUserOrganization)
  const { hasNextPage, hasPreviousPage } = await database.user.findUserOrganizationsPageInfo(
    login,
    items,
    referenceFrom
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
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

export async function findStarredRepositories(login: string, args: PaginationArguments) {
  const referenceFrom = (item: StarredRepository) => item.starred_at.toISOString()
  const documents = await database.user.findStarredRepositoriesByLogin(
    login,
    args
  )

  if (documents.length === 0) return emptyCursorConnection<StarredRepository>()

  const items = documents.map(toStarredRepository)
  const { hasNextPage, hasPreviousPage } = await database.user.findStarredRepositoriesPageInfo(
    login,
    items,
    referenceFrom
  )

  return cursorConnection({ items, referenceFrom, hasNextPage, hasPreviousPage })
}
