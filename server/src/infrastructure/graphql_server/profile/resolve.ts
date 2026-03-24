import { handleError } from '../util/error_handler'
import { OrganizationResolve } from '../organization/resolve'
import { TArgs, TGraphQLContext } from '../graphql/types'
import { TOrganization } from '../../database/model/organization'
import { ProfileOwnerType, TProfileOwner } from '../../database/util/types'
import { TUser } from '../../database/model/user'
import { UserResolve } from '../user/resolve'

type ProfileQueryArgs = {
  login: string
}

export const ProfileResolve = {
  id: (parent: TProfileOwner) => {
    switch (parent.__typename) {
      case 'User': { return `users_${(parent as TUser).user_id}` }
      case 'Organization': { return `organizations_${(parent as TOrganization).organization_id}` }
      default: { throw new Error(`Invalid typename: ${parent.__typename}`) }
    }
  },

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

  profileOwner: async (owner: TProfileOwner) => {
    const profileTypes: ProfileOwnerType[] = ['User', 'Organization']
    if (profileTypes.includes(owner.__typename)) {
      return owner.__typename
    }
    throw new Error(`Invalid typename: ${owner.__typename}`)
  },
}