import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { connectionType, connectionTypeArgs } from '../../util/cursor_connection/graphql_types'
import { idType, NodeInterface } from '../graphql/types'
import { OrganizationResolve } from './resolve'
import { ProfileOwnerInterface } from '../profile/type'
import { RepositoryConnectionType, RepositoryOwnerInterface } from '../repository/type'
import { UserConnectionType } from '../user/type'
import { TOrganization } from '../../database/model/organization'

export const OrganizationType: GraphQLObjectType<TOrganization> = new GraphQLObjectType({
  interfaces: [NodeInterface, ProfileOwnerInterface, RepositoryOwnerInterface],
  name: 'Organization',
  fields: () => ({
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (parent: TOrganization) => parent.avatar_url,
    },
    description: { type: GraphQLString },
    email: { type: GraphQLString },
    id: idType(),
    location: { type: GraphQLString },
    login: { type: new GraphQLNonNull(GraphQLString) },
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
      resolve: (parent: TOrganization) => parent.website_url,
    },
  }),
})

export const OrganizationConnectionType = connectionType(OrganizationType)