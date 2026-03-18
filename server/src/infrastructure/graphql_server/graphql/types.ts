import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
} from 'graphql'

import { TLoaders } from './loaders'

export type TArgs<T = unknown> = Record<string, unknown> & T

export type TGraphQLContext = {
  loader: TLoaders
}

export const idType = () => ({
  type: new GraphQLNonNull(GraphQLID),
})

export const NodeInterface = new GraphQLInterfaceType({
  name: 'Node',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
  }),
})
