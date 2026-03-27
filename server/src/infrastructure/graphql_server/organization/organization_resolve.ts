import { Args, GraphQLContext } from '../graphql/types'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { type Organization } from '../../database'
import { type PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import application from '../../../application'

type OrganizationQueryArgs = {
  login: string
}

export const OrganizationResolve = {
  organization: async (
    parent: undefined,
    args: Args<OrganizationQueryArgs>,
    context: GraphQLContext
  ) => {
    return context.loader.findOrganizationByLogin.load(args.login)
  },

  people: async (parent: Organization, args: PaginationArguments) => {
    try {
      return await application.organization.findMembers(parent.login, args)
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,
}