import { GraphQLObjectType, GraphQLSchema } from 'graphql'

import { OrganizationQuery } from '../organization/organization_query'
import { ProfileQuery } from '../profile/profile_query'
import { UserQuery } from '../user/user_query'

export const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    organization: OrganizationQuery,
    profile: ProfileQuery,
    user: UserQuery,
  }),
})

export const schema = new GraphQLSchema({ query })
