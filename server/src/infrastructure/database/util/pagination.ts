import {
  cursorToReference,
  TBackwardPaginationArgs,
  TForwardPaginationArgs,
  TPageInfoItem,
  TPaginationArgs,
  TReferenceFrom,
  validateArgs,
} from '../../util/cursor_connection/cursor_connection'
import { TModel } from './types'

type TOperator = '<' | '>'
type TOrder = 'ASC' | 'DESC'

export type TPageInfoFnQueryArgs = {
  operator: TOperator
  order: TOrder
  reference: string
  row: TPageInfoItem['row']
}

export type TPaginationQueryArgs = {
  limit: number | undefined
  operator: TOperator
  order: TOrder
  reference: string | undefined
}

function backwardPagination(args: TBackwardPaginationArgs): TPaginationQueryArgs {
  return {
    limit: args.last,
    reference: args.before ? cursorToReference(args.before) : undefined,
    operator: '<',
    order: 'DESC',
  }
}

function forwardPagination(args: TForwardPaginationArgs): TPaginationQueryArgs {
  return {
    limit: args.first,
    reference: args.after ? cursorToReference(args.after) : undefined,
    operator: '>',
    order: 'ASC',
  }
}

export function paginationArgsToQueryArgs(args: TPaginationArgs) {
  validateArgs(args)
  return args.first
    ? forwardPagination(args)
    : backwardPagination(args)
}

type TPageInfoFnQuery = (args: TPageInfoFnQueryArgs) => string
type TFindPageInfoArgs<T> = {
  items: T[]
  pageInfoFnQuery: TPageInfoFnQuery
  referenceFrom: TReferenceFrom<T>
}
export function pageInfoQueries<T extends TModel>(args: TFindPageInfoArgs<T>) {
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