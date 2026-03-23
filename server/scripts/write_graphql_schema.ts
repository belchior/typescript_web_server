import path from 'path'
import { writeFileSync } from 'fs'
import { printSchema } from 'graphql'

import { schema } from '../src/infrastructure/graphql_server/graphql/schema'

const filePath = typeof process.argv[2] === 'string'
  ? process.argv[2]
  : '../client/schema.graphql'

writeFileSync(filePath, printSchema(schema))
console.log(`schema was written at ${path.resolve(filePath)}\n`)