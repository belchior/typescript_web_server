import { handleError } from '../util/error_handler'
import { serialize } from '../../util/converter'
import {
  findRepositoryByOwnerLogin,
  findRepositoryPageInfo,
  findStarredRepositoryByOwnerLogin,
  findStarredRepositoryPageInfo,
  TOwnerIdentifier,
  TRepository,
  TStarredRepository,
} from '../../database/model/repository'
import {
  emptyCursorConnection,
  cursorConnection,
  TPaginationArgs,
} from '../../util/cursor_connection/cursor_connection'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { TRepositoryOwner } from '../../database/util/types'
import { paginationArgsToQueryArgs } from '../../database/util/pagination'

export const RepositoryResolve = {
  forkCount: (parent: TRepository) => {
    return parent.fork_count
  },

  licenseInfo: (parent: TRepository) => {
    return parent.license_name
      ? { name: parent.license_name }
      : undefined
  },

  primaryLanguage: (parent: TRepository) => {
    return parent.language_color && parent.language_name
      ? { color: parent.language_color, name: parent.language_name }
      : undefined
  },

  owner: async (parent: TRepository, args: TArgs, context: TGraphQLContext) => {
    const serializedOwner = serialize<TOwnerIdentifier>({
      owner_login: parent.owner_login,
      owner_ref: parent.owner_ref,
    })

    return context.loader.findRepositoryOwner.load(serializedOwner)
  },

  repositories: async (parent: TRepositoryOwner, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TRepository) => item.created_at.toISOString()
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findRepositoryByOwnerLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TRepository>()

      const pageInfoItems = await findRepositoryPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TRepository>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  starredRepositories: async (parent: TRepositoryOwner, args: TPaginationArgs) => {
    try {
      const referenceFrom = (item: TStarredRepository) => item.starred_at.toISOString()
      const pagination = paginationArgsToQueryArgs(args)
      const items = await findStarredRepositoryByOwnerLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<TStarredRepository>()

      const pageInfoItems = await findStarredRepositoryPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<TStarredRepository>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },
}
