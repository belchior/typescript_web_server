import * as z from 'zod'
import { FastifyRequest } from 'fastify'

import { PaginationArguments, validateArgs } from '../../util/cursor_connection/cursor_connection'
import { ParamsValidationError, QueryValidationError } from './error_handler'

export function queryToPaginationArgs(query: unknown) {
  try {
    const args = Object.entries(query as Record<string, unknown>).reduce((acc, [key, value]) => {
      if (['first', 'last'].includes(key)) acc[key] = Number(value)
      if (['after', 'before'].includes(key)) acc[key] = value
      return acc
    }, {} as Record<string, unknown>)

    validateArgs(args)

    return args as PaginationArguments
  } catch (error) {
    throw new QueryValidationError((error as Error).message)
  }
}

export type OwnerIdentity = {
  login: string
}
export function paramsToOwnerIdentity(request: FastifyRequest): OwnerIdentity {
  try {
    const schema = z.object({
      login: z.string().min(3).max(255).regex(/^[a-zA-Z]/),
    })

    const validate = request.compileValidationSchema(schema)
    if (validate(request.params) === false) {
      throw new Error('validation error')
    }
    const { login } = request.params as OwnerIdentity

    return { login }
  } catch (_error) {
    throw new ParamsValidationError('URL path must contains a valid login segment')
  }
}
