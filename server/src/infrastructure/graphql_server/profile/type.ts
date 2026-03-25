import {
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { connectionType } from '../../util/cursor_connection/graphql_types'
import { idType } from '../graphql/types'
import { ProfileResolve } from './resolve'
import { TFollowing } from '../../database/model/profileOwner'

export const ProfileOwnerInterface = new GraphQLInterfaceType({
  name: 'ProfileOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    login: idType(),
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: ProfileResolve.profileOwner,
})

export const FollowingType: GraphQLObjectType<TFollowing> = new GraphQLObjectType({
  interfaces: [ProfileOwnerInterface],
  name: 'Following',
  fields: () => ({
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent) => parent.avatar_url,
    },
    followingAt: {
      type: GraphQLString,
      resolve: (parent) => parent.following_at.toISOString(),
    },
    login: idType(),
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

export const FollowingConnectionType = connectionType(FollowingType)