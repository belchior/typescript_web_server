import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'

import { connectionType } from '../../util/cursor_connection/graphql_types'
import { idType, NodeInterface } from '../graphql/types'
import { ProfileResolve } from './resolve'

export const ProfileOwnerInterface = new GraphQLInterfaceType({
  interfaces: [NodeInterface],
  name: 'ProfileOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ProfileResolve.id,
    },
    login: idType(),
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: ProfileResolve.profileOwner,
})

export const ProfileOwnerConnectionType = connectionType(ProfileOwnerInterface)