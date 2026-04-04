import database, { type Repository, Follower } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'
import * as organization from './organization'
import * as user from './user'

export async function findProfile(login: string) {
  const result = await Promise.allSettled([
    organization.findOrganization(login),
    user.findUser(login),
  ])

  const item = result
    .filter(item => item.status === 'fulfilled')
    .find(item => item.value != null)

  return item?.value
}

export async function findFollowers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Follower) => item.followed_at.toISOString()
  const items = await database.profileOwner.findFollowersByUserLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Follower>()

  const { hasNextPage, hasPreviousPage } = await database.profileOwner.findFollowersPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Follower>({ items, referenceFrom, hasNextPage, hasPreviousPage })
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
