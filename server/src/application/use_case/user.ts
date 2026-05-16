import database, { Follower, Following, Repository, StarredRepository, UserOrganization } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'

export async function findUser(login: string) {
  return await database.user.findOneByLogin(login)
}

export async function findFollowers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Follower) => item.follows_since.toISOString()
  const items = await database.profileOwner.findFollowersByUserLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Follower>()

  const { hasNextPage, hasPreviousPage } = await database.profileOwner.findFollowersPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Follower>({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findFollowingProfiles(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Following) => item.followed_since.toISOString()
  const items = await database.user.findFollowingByLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Following>()

  const { hasNextPage, hasPreviousPage } = await database.user.findFollowingPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Following>({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findUserOrganizations(login: string, args: PaginationArguments) {
  const referenceFrom = (item: UserOrganization) => item.joined_at.toISOString()
  const items = await database.user.findUserOrganizationsByLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<UserOrganization>()

  const { hasNextPage, hasPreviousPage } = await database.user.findOrganizationsPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<UserOrganization>({
    items,
    referenceFrom,
    hasNextPage,
    hasPreviousPage,
  })
}

export async function findRepositories(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Repository) => item.created_at.toISOString()
  const items = await database.repository.findRepositoriesByLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Repository>()

  const { hasNextPage, hasPreviousPage } = await database.repository.findRepositoriesPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Repository>({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function starredRepositories(login: string, args: PaginationArguments) {
  const referenceFrom = (item: StarredRepository) => item.starred_at.toISOString()
  const items = await database.repository.findStarredRepositoriesByLogin(
    login,
    args
  )

  if (items.length === 0) return emptyCursorConnection<StarredRepository>()

  const {
    hasNextPage,
    hasPreviousPage,
  } = await database.repository.findStarredRepositoriesPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<StarredRepository>({
    items,
    referenceFrom,
    hasNextPage,
    hasPreviousPage,
  })
}
