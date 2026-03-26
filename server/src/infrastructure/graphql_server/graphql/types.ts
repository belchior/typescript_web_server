import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
} from 'graphql'

import { Loaders } from './loaders'

export type Args<T = unknown> = Record<string, unknown> & T

export type GraphQLContext = {
  loader: Loaders
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
