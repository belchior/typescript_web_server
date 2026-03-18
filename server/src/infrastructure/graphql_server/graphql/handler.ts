import { createHandler } from 'graphql-http/lib/use/express'
import { createLoaders } from './loaders'
import { schema } from './schema'

export function createGraphqlHandler() {
  return createHandler({
    schema: schema,
    context: {
      loader: createLoaders(),
    },
  })
}
