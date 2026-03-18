import { GraphQLNonNull, GraphQLString } from 'graphql'

import { OrganizationType } from './type'
import { OrganizationResolve } from './resolve'

export const OrganizationQuery = {
  type: OrganizationType,
  args: { login: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: OrganizationResolve.organization,
}