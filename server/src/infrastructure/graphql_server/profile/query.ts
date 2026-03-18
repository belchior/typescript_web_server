import { GraphQLNonNull, GraphQLString } from 'graphql'

import { ProfileOwnerInterface } from './type'
import { ProfileResolve } from './resolve'

export const ProfileQuery = {
  type: ProfileOwnerInterface,
  args: { login: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: ProfileResolve.profile,
}