import { emptyCursorConnection, cursorConnection, TPaginationArgs } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/repository_resolve'
import { TArgs, TGraphQLContext } from '../graphql/types'
import database, { TOrganization, TOrganizationMember, TUserOrganization } from '../../database'

type OrganizationQueryArgs = {
  login: string
}

export const OrganizationResolve = {
  organization: async (parent: undefined, args: TArgs<OrganizationQueryArgs>, context: TGraphQLContext) => {
    return context.loader.findOrganizationByLogin.load(args.login)
  },

  people: async (parent: TOrganization, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TOrganizationMember) => item.joined_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.organization.findOrganizationPeopleByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TUserOrganization>()

      const pageInfoItems = await database.organization.findOrganizationPeoplePageInfo(
        parent.login,
        items,
        referenceFrom
      )
      return cursorConnection<TOrganizationMember>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,
}