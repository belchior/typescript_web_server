import { addTypename, modelId } from '../util/model_adapter'
import { Args, GraphQLContext } from '../graphql/types'
import { handleError } from '../util/error_handler'
import { OrganizationResolve } from '../organization/organization_resolve'
import { type Organization, ProfileOwner, User } from '../../database'
import { UserResolve } from '../user/user_resolve'

type ProfileQueryArgs = {
  login: string
}

export const ProfileResolve = {
  node: async (parent: undefined, args: Args<{ id: string }>, context: GraphQLContext) => {
    const loginArg = await context.loader.findOwnersIdentityById.load(modelId(args.id))
    const profile = await ProfileResolve.profile(parent, loginArg, context)
    addTypename(loginArg, profile)

    return profile
  },

  profile: async (parent: undefined, args: Args<ProfileQueryArgs>, context: GraphQLContext) => {
    try {
      const userPromise = UserResolve.user(parent, args, context)
      const organizationPromise = OrganizationResolve.organization(parent, args, context)
      const result = await Promise.allSettled([userPromise, organizationPromise])
      const item = result.find(item => item.status === 'fulfilled')

      if (item?.value == null) {
        throw new Error(`Profile not found with login: ${args.login}`)
      }
      return item.value
    } catch (error) {
      return handleError(error as Error)
    }
  },

  profileOwner: async (owner: ProfileOwner) => {
    if ((owner as User)?.user_id) return 'User'
    if ((owner as Organization)?.organization_id) return 'Organization'
    throw new Error('Invalid typename', { cause: owner })
  },
}