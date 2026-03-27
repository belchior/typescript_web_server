import { emptyCursorConnection, cursorConnection, PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { Args, GraphQLContext } from '../graphql/types'
import database, { Organization, OrganizationMember } from '../../database'

type OrganizationQueryArgs = {
  login: string
}

export const OrganizationResolve = {
  organization: async (parent: undefined, args: Args<OrganizationQueryArgs>, context: GraphQLContext) => {
    return context.loader.findOrganizationByLogin.load(args.login)
  },

  people: async (parent: Organization, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: OrganizationMember) => item.joined_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.organization.findOrganizationPeopleByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<OrganizationMember>()

      const { hasNextPage, hasPreviousPage } = await database.organization.findOrganizationPeoplePageInfo(
        parent.login,
        items,
        referenceFrom
      )
      return cursorConnection<OrganizationMember>({ items, referenceFrom, hasNextPage, hasPreviousPage })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,
}