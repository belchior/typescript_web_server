import { emptyCursorConnection, cursorConnection, TPaginationArgs } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { TArgs, TGraphQLContext } from '../graphql/types'
import database, { type TFollower, TProfileOwner, TUser, TUserOrganization } from '../../database'

type UserQueryArgs = {
  login: string
}

export const UserResolve = {
  user: async (parent: undefined, args: TArgs<UserQueryArgs>, context: TGraphQLContext) => {
    return context.loader.findUserByLogin.load(args.login)
  },

  followers: async (parent: TProfileOwner, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TFollower) => item.followed_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.user.findFollowersByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TFollower>()

      const pageInfoItems = await database.user.findFollowersPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TFollower>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  organizations: async (parent: TUser, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TUserOrganization) => item.joined_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.user.findOrganizationsByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TUserOrganization>()

      const pageInfoItems = await database.user.findOrganizationsPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TUserOrganization>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,

  starredRepositories: RepositoryResolve.starredRepositories,
}
