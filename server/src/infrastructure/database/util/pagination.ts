import {
  cursorToReference,
  BackwardPagination,
  ForwardPagination,
  PaginationArguments,
  validateArgs,
} from '../../util/cursor_connection/cursor_connection'

export type PaginationQueryArgs = {
  limit: number
  operator: '$gt' | '$lt'
  reference: string | undefined
  sort: 1 | -1
}

function backwardPagination(args: BackwardPagination): PaginationQueryArgs {
  return {
    limit: args.last!,
    operator: '$lt',
    reference: args.before ? cursorToReference(args.before) : undefined,
    sort: -1,
  }
}

function forwardPagination(args: ForwardPagination): PaginationQueryArgs {
  return {
    limit: args.first!,
    operator: '$gt',
    reference: args.after ? cursorToReference(args.after) : undefined,
    sort: 1,
  }
}

export function paginationArgsToQueryArgs(args: PaginationArguments) {
  validateArgs(args)
  return args.first
    ? forwardPagination(args)
    : backwardPagination(args)
}
