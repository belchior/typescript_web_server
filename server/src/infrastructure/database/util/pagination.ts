import {
  cursorToReference,
  BackwardPagination,
  ForwardPagination,
  PageInfoItem,
  PaginationArguments,
  validateArgs,
  ReferenceFrom,
} from '../../util/cursor_connection/cursor_connection'
import { Model } from './types'

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

type PageInfoFnQuery = (args: PageInfoFnQueryArgs) => string
type FindPageInfoArgs<T> = {
  items: T[]
  pageInfoFnQuery: PageInfoFnQuery
  referenceFrom: ReferenceFrom<T>
}
export function pageInfoQueries<T extends Model>(args: FindPageInfoArgs<T>) {
  const { items, pageInfoFnQuery, referenceFrom } = args

  const firstItem = items.at(0)
  const lastItem = items.at(-1)

  const prevQuery = pageInfoFnQuery({
    reference: referenceFrom(firstItem!),
    operator: '<',
    order: 'DESC',
    row: 'prev',
  })
  const nextQuery = pageInfoFnQuery({
    reference: referenceFrom(lastItem!),
    operator: '>',
    order: 'ASC',
    row: 'next',
  })

  return { prevQuery, nextQuery }
}