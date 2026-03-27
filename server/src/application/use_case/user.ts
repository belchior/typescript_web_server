import database, { UserOrganization, type Follower } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, type PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'

export async function findFollowers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: Follower) => item.followed_at.toISOString()
  const items = await database.user.findFollowersByUserLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<Follower>()

  const { hasNextPage, hasPreviousPage } = await database.user.findFollowersPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<Follower>({ items, referenceFrom, hasNextPage, hasPreviousPage })
}

export async function findUserOrganizations(login: string, args: PaginationArguments) {
  const referenceFrom = (item: UserOrganization) => item.joined_at.toISOString()
  const items = await database.user.findOrganizationsByUserLogin(login, args)

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