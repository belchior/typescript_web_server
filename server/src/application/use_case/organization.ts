import database, { type OrganizationMember } from '../../infrastructure/database'
import { cursorConnection, emptyCursorConnection, PaginationArguments } from '../../infrastructure/util/cursor_connection/cursor_connection'

export async function findMembers(login: string, args: PaginationArguments) {
  const referenceFrom = (item: OrganizationMember) => item.joined_at.toISOString()
  const items = await database.organization.findOrganizationMembersByLogin(login, args)

  if (items.length === 0) return emptyCursorConnection<OrganizationMember>()

  const {
    hasNextPage,
    hasPreviousPage,
  } = await database.organization.findOrganizationMembersPageInfo(
    login,
    items,
    referenceFrom
  )
  return cursorConnection<OrganizationMember>({
    items,
    referenceFrom,
    hasNextPage,
    hasPreviousPage,
  })
}