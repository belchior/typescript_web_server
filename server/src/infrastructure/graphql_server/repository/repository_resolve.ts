import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { handleError } from '../util/error_handler'
import { serialize } from '../../util/converter'
import { Args, GraphQLContext } from '../graphql/types'
import { type ProfileOwnerIdentifier, Repository, RepositoryOwner } from '../../database'
import application from '../../../application'

export const RepositoryResolve = {
  id: (parent: Repository) => {
    return `re_${parent.repository_id}`
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
      return await application.profile.findRepositories(parent.login, args)
    } catch (error) {
      return handleError(error as Error)
    }
  },

  starredRepositories: async (parent: RepositoryOwner, args: PaginationArguments) => {
    try {
      return await application.profile.starredRepositories(parent.login, args)
    } catch (error) {
      return handleError(error as Error)
    }
  },
}
