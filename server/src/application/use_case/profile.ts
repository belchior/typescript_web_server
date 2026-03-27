import database, { type Repository, Following, StarredRepository } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'

export async function findFollowingProfiles(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Following) => item.following_at.toISOString()
  const items = await database.profileOwner.findFollowingByLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Following>()

  const { hasNextPage, hasPreviousPage } = await database.profileOwner.findFollowingPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Following>({ items, referenceFrom, hasNextPage, hasPreviousPage })
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