import { TOwner } from '../../database/util/types'
import { handleError } from '../util/error_handler'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { OrganizationResolve } from '../organization/resolve'
import { UserResolve } from '../user/resolve'

type ProfileQueryArgs = {
  login: string
}

export const ProfileResolve = {
  profile: async (parent: undefined, args: TArgs<ProfileQueryArgs>, context: TGraphQLContext) => {
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

  profileOwner: async (value: TOwner) => {
    if (['User', 'Organization'].includes(value.__typename)) {
      return value.__typename
    }
    throw new Error(`Invalid typename: ${value.__typename}`)
  },
}