import database, { Following, StarredRepository, UserOrganization } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'

export async function findUser(login: string) {
  return await database.user.findOneByLogin(login)
}

export async function findFollowingProfiles(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Following) => item.following_at.toISOString()
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