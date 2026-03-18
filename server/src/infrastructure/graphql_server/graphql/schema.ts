import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { OrganizationQuery } from '../organization/query'
import { ProfileQuery } from '../profile/query'
import { UserQuery } from '../user/query'

export const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    organization: OrganizationQuery,
    profile: ProfileQuery,
    user: UserQuery,
  }),
})

export const schema = new GraphQLSchema({ query })
