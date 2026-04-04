import * as z from 'zod'

import { PaginationArguments, validateArgs } from '../../util/cursor_connection/cursor_connection'
import { ParamsValidationError, QueryValidationError } from './error_handler'

export function queryToPaginationArgs(query: Record<string, unknown>) {
  try {
    const args = Object.entries(query).reduce((acc, [key, value]) => {
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
export function paramsToOwnerIdentity(params: Record<string, unknown>): OwnerIdentity {
  try {
    const validParams = z.object({
      login: z.string().min(3).max(255).regex(/^[a-zA-Z]/),
    }).parse(params)

    return validParams
  } catch (_error) {
    throw new ParamsValidationError('URL path must contains a valid login segment')
  }
}