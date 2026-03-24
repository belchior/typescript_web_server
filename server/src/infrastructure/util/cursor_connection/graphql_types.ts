import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql'
import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLInterfaceType,
} from 'graphql'

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: () => ({
    endCursor: { type: GraphQLString },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    startCursor: { type: GraphQLString },
  }),
})

export const connectionType = (Type: GraphQLObjectType | GraphQLInterfaceType) => {
  const EdgeType = new GraphQLObjectType({
    name: `${Type.name}Edge`,
    fields: () => ({
      cursor: { type: new GraphQLNonNull(GraphQLString) },
      node: { type: Type },
    }),
  })
  const ConnectionType = new GraphQLObjectType({
    name: `${Type.name}Connection`,
    fields: () => ({
      edges: { type: new GraphQLNonNull(new GraphQLList(EdgeType)) },
      pageInfo: { type: new GraphQLNonNull(PageInfoType) },
    }),
  })
  return new GraphQLNonNull(ConnectionType)
}

export const connectionTypeArgs: () => GraphQLFieldConfigArgumentMap = () => ({
  after: { type: GraphQLString },
  before: { type: GraphQLString },
  first: { type: GraphQLInt },
  last: { type: GraphQLInt },
})
