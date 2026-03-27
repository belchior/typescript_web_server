import { emptyCursorConnection, PaginationArguments, cursorConnection } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { Args, GraphQLContext } from '../graphql/types'
import database, { type Follower, ProfileOwner, User, UserOrganization } from '../../database'

type UserQueryArgs = {
  login: string
}

export const UserResolve = {
  user: async (parent: undefined, args: Args<UserQueryArgs>, context: GraphQLContext) => {
    return context.loader.findUserByLogin.load(args.login)
  },

  followers: async (parent: ProfileOwner, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: Follower) => item.followed_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.user.findFollowersByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<Follower>()

      const { hasNextPage, hasPreviousPage } = await database.user.findFollowersPageInfo(
        parent.login,
        items,
        referenceFrom
      )
      return cursorConnection<Follower>({ items, referenceFrom, hasNextPage, hasPreviousPage })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  organizations: async (parent: User, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: UserOrganization) => item.joined_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.user.findOrganizationsByUserLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<UserOrganization>()

      const { hasNextPage, hasPreviousPage } = await database.user.findOrganizationsPageInfo(
        parent.login,
        items,
        referenceFrom
      )
      return cursorConnection<UserOrganization>({
        items,
        referenceFrom,
        hasNextPage,
        hasPreviousPage,
      })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,

  starredRepositories: RepositoryResolve.starredRepositories,
}
