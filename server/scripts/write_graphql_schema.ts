import { writeFileSync } from 'fs'
import { printSchema } from 'graphql'

import { schema } from '../src/infrastructure/graphql_server/graphql/schema.ts'

const filePath = typeof process.argv[2] === 'string'
  ? process.argv[2]
  : '../client/src/schema.graphql'

writeFileSync(filePath, printSchema(schema))
