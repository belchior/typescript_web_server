import {
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'

import { idType } from '../graphql/types'
import { ProfileResolve } from './resolve'

export const ProfileOwnerInterface = new GraphQLInterfaceType({
  name: 'ProfileOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    id: idType(),
    login: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: ProfileResolve.profileOwner,
})