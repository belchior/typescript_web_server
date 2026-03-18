import { GraphQLNonNull, GraphQLString } from 'graphql'

import { UserResolve } from './resolve'
import { UserType } from './type'

export const UserQuery = {
  type: UserType,
  args: { login: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: UserResolve.user,
}