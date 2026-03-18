import { emptyCursorConnection, cursorConnection, TPaginationArgs } from '../../util/cursor_connection/cursor_connection'
import { findOrganizationPeopleByLogin, findOrganizationPeoplePageInfo, TOrganization, TOrganizationMember } from '../../database/model/organization'
import { handleError } from '../util/error_handler'
import { RepositoryResolve } from '../repository/resolve'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { TUserOrganization } from '../../database/model/user'
import { paginationArgsToQueryArgs } from '../../database/util/pagination'

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
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findOrganizationPeopleByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TUserOrganization>()

      const pageInfoItems = await findOrganizationPeoplePageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TOrganizationMember>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  repositories: RepositoryResolve.repositories,
}