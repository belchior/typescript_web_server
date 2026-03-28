import {
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { connectionType, connectionTypeArgs } from '../../util/cursor_connection/graphql_types'
import { idType, NodeInterface } from '../graphql/types'
import { ProfileOwnerInterface } from '../profile/profile_type'
import { RepositoryResolve } from './repository_resolve'
import { Organization, User, type RepositoryOwner } from '../../database'

const LanguageType = new GraphQLObjectType({
  name: 'Language',
  fields: () => ({
    color: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

const LicenseType = new GraphQLObjectType({
  name: 'License',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

export const RepositoryOwnerInterface = new GraphQLInterfaceType({
  interfaces: [ProfileOwnerInterface],
  name: 'RepositoryOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    login: idType(),
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    repositories: {
      type: RepositoryConnectionType,
      args: connectionTypeArgs(),
    },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: async (owner: RepositoryOwner) => {
    if ((owner as User)?.user_id) return 'User'
    if ((owner as Organization)?.organization_id) return 'Organization'
    throw new Error('Invalid typename', { cause: owner })
  },
})

export const RepositoryType = new GraphQLObjectType({
  interfaces: [NodeInterface],
  name: 'Repository',
  fields: () => ({
    description: { type: GraphQLString },
    forkCount: {
      type: GraphQLInt,
      resolve: RepositoryResolve.forkCount,
    },
    starCount: {
      type: GraphQLInt,
      resolve: RepositoryResolve.starCount,
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: RepositoryResolve.id,
    },
    licenseInfo: {
      type: LicenseType,
      resolve: RepositoryResolve.licenseInfo,
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    owner: {
      type: new GraphQLNonNull(RepositoryOwnerInterface),
      resolve: RepositoryResolve.owner,
    },
    primaryLanguage: {
      type: LanguageType,
      resolve: RepositoryResolve.primaryLanguage,
    },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

export const RepositoryConnectionType = connectionType(RepositoryType)