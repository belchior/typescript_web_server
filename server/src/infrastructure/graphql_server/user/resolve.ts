import { handleError } from '../util/error_handler'
import {
  findFollowersByUserLogin,
  findFollowersPageInfo,
  findFollowingByUserLogin,
  findFollowingPageInfo,
  findOrganizationsByUserLogin,
  findOrganizationsPageInfo,
  TFollower,
  TFollowing,
  TUser,
  TUserOrganization,
} from '../../database/model/user'
import { RepositoryResolve } from '../repository/resolve'
import {
  emptyCursorConnection,
  cursorConnection,
  TPaginationArgs,
} from '../../util/cursor_connection/cursor_connection'
import { paginationArgsToQueryArgs } from '../../database/util/pagination'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { TProfileOwner } from '../../database/util/types'

type UserQueryArgs = {
  login: string
}

export const UserResolve = {
  user: async (parent: undefined, args: TArgs<UserQueryArgs>, context: TGraphQLContext) => {
    return context.loader.findUserByLogin.load(args.login)
  },

  followers: async (parent: TUser, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TFollower) => item.followed_at.toISOString()
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findFollowersByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TFollower>()

      const pageInfoItems = await findFollowersPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TFollower>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  following: async (parent: TProfileOwner, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TFollowing) => item.following_at.toISOString()
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findFollowingByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TFollowing>()

      const pageInfoItems = await findFollowingPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TFollowing>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  organizations: async (parent: TUser, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TUserOrganization) => item.joined_at.toISOString()
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findOrganizationsByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TUserOrganization>()

      const pageInfoItems = await findOrganizationsPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TUserOrganization>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,

  starredRepositories: RepositoryResolve.starredRepositories,
}
