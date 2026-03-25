import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { connectionType, connectionTypeArgs } from '../../util/cursor_connection/graphql_types'
import { FollowingConnectionType, ProfileOwnerInterface } from '../profile/profile_type'
import { idType, NodeInterface } from '../graphql/types'
import { OrganizationConnectionType } from '../organization/organization_type'
import { ProfileResolve } from '../profile/profile_resolve'
import { RepositoryConnectionType, RepositoryOwnerInterface } from '../repository/repository_type'
import { UserResolve } from './user_resolve'
import { type TUser } from '../../database'

export const UserType: GraphQLObjectType<TUser> = new GraphQLObjectType({
  interfaces: [NodeInterface, ProfileOwnerInterface, RepositoryOwnerInterface],
  name: 'User',
  fields: () => ({
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent: TUser) => parent.avatar_url,
    },
    bio: { type: GraphQLString },
    company: { type: GraphQLString },
    email: { type: new GraphQLNonNull(GraphQLString) },
    followers: {
      type: UserConnectionType,
      args: connectionTypeArgs(),
      resolve: UserResolve.followers,
    },
    following: {
      type: FollowingConnectionType,
      args: connectionTypeArgs(),
      resolve: ProfileResolve.following,
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (parent) => `users_${parent.user_id}`,
    },
    location: { type: GraphQLString },
    login: idType(),
    name: { type: GraphQLString },
    organizations: {
      type: OrganizationConnectionType,
      args: connectionTypeArgs(),
      resolve: UserResolve.organizations,
    },
    repositories: {
      type: RepositoryConnectionType,
      args: connectionTypeArgs(),
      resolve: UserResolve.repositories,
    },
    starredRepositories: {
      type: RepositoryConnectionType,
      args: connectionTypeArgs(),
      resolve: UserResolve.starredRepositories,
    },
    url: { type: new GraphQLNonNull(GraphQLString) },
    websiteUrl: {
      type: GraphQLString,
      resolve: (parent: TUser) => parent.website_url,
    },
  }),
})

export const UserConnectionType = connectionType(UserType)