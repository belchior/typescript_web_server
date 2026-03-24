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
import { RepositoryResolve } from './resolve'
import { TRepositoryOwner } from '../../database/util/types'
import { TUser } from '../../database/model/user'
import { TOrganization } from '../../database/model/organization'

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
  interfaces: [NodeInterface],
  name: 'RepositoryOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (parent: TRepositoryOwner) => {
        switch (parent.__typename) {
          case 'User': { return `users_${(parent as TUser).user_id}` }
          case 'Organization': { return `organizations_${(parent as TOrganization).organization_id}` }
          default: { throw new Error(`unknown typename: ${parent.__typename}`) }
        }
      },
    },
    login: idType(),
    name: { type: GraphQLString },
    repositories: {
      type: RepositoryConnectionType,
      args: connectionTypeArgs(),
    },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: async (value: TRepositoryOwner) => {
    if (['User', 'Organization'].includes(value.__typename)) {
      return value.__typename
    }
    throw new Error(`Invalid typename: ${value.__typename}`)
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