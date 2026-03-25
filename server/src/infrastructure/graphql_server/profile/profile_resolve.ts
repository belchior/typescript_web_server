import { cursorConnection, emptyCursorConnection, TPaginationArgs } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { OrganizationResolve } from '../organization/organization_resolve'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { UserResolve } from '../user/user_resolve'
import database, { type ProfileOwnerType, TFollowing, TProfileOwner } from '../../database'

type ProfileQueryArgs = {
  login: string
}

export const ProfileResolve = {
  following: async (parent: TProfileOwner, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TFollowing) => item.following_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.profileOwner.findFollowingByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TFollowing>()

      const pageInfoItems = await database.profileOwner.findFollowingPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TFollowing>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  profile: async (parent: undefined, args: TArgs<ProfileQueryArgs>, context: TGraphQLContext) => {
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

  profileOwner: async (owner: TProfileOwner) => {
    const profileTypes: ProfileOwnerType[] = ['User', 'Organization']
    if (profileTypes.includes(owner.__typename)) {
      return owner.__typename
    }
    throw new Error(`Invalid typename: ${owner.__typename}`)
  },
}