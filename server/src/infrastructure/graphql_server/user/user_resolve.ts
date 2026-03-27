import { Args, GraphQLContext } from '../graphql/types'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { type PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { type ProfileOwner, User } from '../../database'
import application from '../../../application'

type UserQueryArgs = {
  login: string
}

export const UserResolve = {
  user: async (parent: undefined, args: Args<UserQueryArgs>, context: GraphQLContext) => {
    return context.loader.findUserByLogin.load(args.login)
  },

  followers: async (parent: ProfileOwner, args: PaginationArguments) => {
    try {
      return await application.user.findFollowers(parent.login, args)
    } catch (error) {
      return handleError(error as Error)
    }
  },

  organizations: async (parent: User, args: PaginationArguments) => {
    try {
      return await application.user.findUserOrganizations(parent.login, args)
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,

  starredRepositories: RepositoryResolve.starredRepositories,
}
