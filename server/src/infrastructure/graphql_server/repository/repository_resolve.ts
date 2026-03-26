import { emptyCursorConnection, cursorConnection, PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { serialize } from '../../util/converter'
import { Args, GraphQLContext } from '../graphql/types'
import database, { type ProfileOwnerIdentifier, Repository, RepositoryOwner, StarredRepository } from '../../database'

export const RepositoryResolve = {
  id: (parent: Repository) => {
    return `repositories_${parent.repository_id}`
  },

  forkCount: (parent: Repository) => {
    return parent.fork_count
  },

  starCount: (parent: Repository) => {
    return parent.star_count
  },

  licenseInfo: (parent: Repository) => {
    return parent.license_name
      ? { name: parent.license_name }
      : undefined
  },

  primaryLanguage: (parent: Repository) => {
    return parent.language_color && parent.language_name
      ? { color: parent.language_color, name: parent.language_name }
      : undefined
  },

  owner: async (parent: Repository, args: Args, context: GraphQLContext) => {
    const serializedOwner = serialize<ProfileOwnerIdentifier>({
      owner_login: parent.owner_login,
      owner_ref: parent.owner_ref,
    })

    return context.loader.findRepositoryOwner.load(serializedOwner)
  },

  repositories: async (parent: RepositoryOwner, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: Repository) => item.created_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.repository.findRepositoriesByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<Repository>()

      const pageInfoItems = await database.repository.findRepositoriesPageInfo(parent.login, items, referenceFrom)
      return cursorConnection<Repository>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },

  starredRepositories: async (parent: RepositoryOwner, args: PaginationArguments) => {
    try {
      const referenceFrom = (item: StarredRepository) => item.starred_at.toISOString()
      const pagination = database.util.paginationArgsToQueryArgs(args)
      const items = await database.repository.findStarredRepositoriesByLogin(parent.login, pagination)

      if (items.length === 0) return emptyCursorConnection<StarredRepository>()

      const pageInfoItems = await database.repository.findStarredRepositoriesPageInfo(
        parent.login,
        items,
        referenceFrom
      )
      return cursorConnection<StarredRepository>({ items, pageInfoItems, referenceFrom })
    } catch (error) {
      return handleError(error as Error)
    }
  },
}
