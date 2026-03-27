import {
  cursorToReference,
  BackwardPagination,
  ForwardPagination,
  PaginationArguments,
  validateArgs,
} from '../../util/cursor_connection/cursor_connection'
import { PageInfoItem } from './types'

type Operator = '<' | '>'
type Order = 'ASC' | 'DESC'

export type PageInfoFnQueryArgs = {
  operator: Operator
  order: Order
  reference: string
  row: PageInfoItem['row']
}

export type PaginationQueryArgs = {
  limit: number | undefined
  operator: Operator
  order: Order
  reference: string | undefined
}

function backwardPagination(args: BackwardPagination): PaginationQueryArgs {
  return {
    limit: args.last,
    reference: args.before ? cursorToReference(args.before) : undefined,
    operator: '<',
    order: 'DESC',
  }
}

function forwardPagination(args: ForwardPagination): PaginationQueryArgs {
  return {
    limit: args.first,
    reference: args.after ? cursorToReference(args.after) : undefined,
    operator: '>',
    order: 'ASC',
  }
}

export function paginationArgsToQueryArgs(args: PaginationArguments) {
  validateArgs(args)
  return args.first
    ? forwardPagination(args)
    : backwardPagination(args)
}

