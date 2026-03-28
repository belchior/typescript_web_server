import { GraphQLObjectType, GraphQLSchema } from 'graphql'

import { idType, NodeInterface } from './types'
import { OrganizationResolve } from '../organization/organization_resolve'
import { OrganizationType } from '../organization/organization_type'
import { ProfileOwnerInterface } from '../profile/profile_type'
import { ProfileResolve } from '../profile/profile_resolve'
import { UserResolve } from '../user/user_resolve'
import { UserType } from '../user/user_type'

export const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    organization: {
      type: OrganizationType,
      args: { login: idType() },
      resolve: OrganizationResolve.organization,
    },
    profile: {
      type: ProfileOwnerInterface,
      args: { login: idType() },
      resolve: ProfileResolve.profile,
    },
    user: {
      type: UserType,
      args: { login: idType() },
      resolve: UserResolve.user,
    },
    node: {
      type: NodeInterface,
      args: { id: idType() },
      resolve: ProfileResolve.node,
    },
  }),
})

export const schema = new GraphQLSchema({ query })
