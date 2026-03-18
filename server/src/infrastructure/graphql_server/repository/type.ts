import {
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
  name: 'RepositoryOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    id: idType(),
    login: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    // repositories: {
    //   type: RepositoryConnectionType,
    //   args: connectionTypeArgs(),
    // },
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
    id: idType(),
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