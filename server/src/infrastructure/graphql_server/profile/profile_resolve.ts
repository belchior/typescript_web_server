import { cursorConnection, emptyCursorConnection, PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { OrganizationResolve } from '../organization/organization_resolve'
import { Args, GraphQLContext } from '../graphql/types'
import { UserResolve } from '../user/user_resolve'
import database, { type Following, Organization, ProfileOwner, User } from '../../database'

type ProfileQueryArgs = {
  login: string
}

export const ProfileResolve = {
  following: async (parent: ProfileOwner, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: Following) => item.following_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.profileOwner.findFollowingByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<Following>()

      const pageInfoItems = await database.profileOwner.findFollowingPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<Following>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  profile: async (parent: undefined, args: Args<ProfileQueryArgs>, context: GraphQLContext) => {
    try {
      const userPromise = UserResolve.user(parent, args, context)
      const organizationPromise = OrganizationResolve.organization(parent, args, context)
      const result = await Promise.allSettled([userPromise, organizationPromise])
      const item = result.find(item => item.status === 'fulfilled')

      if (item?.value == null) {
        throw new Error(`Profile not found with login: ${args.login}`)
      }
      return item.value
    } catch (error) {
      return handleError(error as Error)
    }
  },

  profileOwner: async (owner: ProfileOwner) => {
    if ((owner as User)?.user_id) return 'User'
    if ((owner as Organization)?.organization_id) return 'Organization'

    throw new Error('Invalid typename')
  },
}