import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { connectionType, connectionTypeArgs } from '../../util/cursor_connection/graphql_types'
import { idType, NodeInterface } from '../graphql/types'
import { OrganizationResolve } from './organization_resolve'
import { ProfileOwnerInterface } from '../profile/profile_type'
import { RepositoryConnectionType, RepositoryOwnerInterface } from '../repository/repository_type'
import { UserConnectionType } from '../user/user_type'
import { UserResolve } from '../user/user_resolve'
import { type Organization } from '../../database'

export const OrganizationType: GraphQLObjectType<Organization> = new GraphQLObjectType({
  interfaces: [NodeInterface, ProfileOwnerInterface, RepositoryOwnerInterface],
  name: 'Organization',
  fields: () => ({
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent: Organization) => parent.avatar_url,
    },
    description: { type: GraphQLString },
    email: { type: GraphQLString },
    followers: {
      type: UserConnectionType,
      args: connectionTypeArgs(),
      resolve: UserResolve.followers,
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (parent) => `or_${parent.organization_id}`,
    },
    location: { type: GraphQLString },
    login: idType(),
    name: { type: GraphQLString },
    people: {
      type: UserConnectionType,
      args: connectionTypeArgs(),
      resolve: OrganizationResolve.people,
    },
    repositories: {
      type: RepositoryConnectionType,
      args: connectionTypeArgs(),
      resolve: OrganizationResolve.repositories,
    },
    url: { type: new GraphQLNonNull(GraphQLString) },
    websiteUrl: {
      type: GraphQLString,
      resolve: (parent: Organization) => parent.website_url,
    },
  }),
})

export const OrganizationConnectionType = connectionType(OrganizationType)