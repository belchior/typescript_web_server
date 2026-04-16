import logger from '../../util/logger'

export type ErrorBody = {
  errors: string[]
}

type ErrorContext = {
  error: Error
  status?: number
  message?: string
}

export function errorBody(args: ErrorContext): ErrorBody {
  const { error, message } = args
  const finalMessage = message ?? error?.message

  logger.error({
    message: message ?? undefined,
    error: {
      message: error?.message,
    },
  })

  return {
    errors: [finalMessage],
  }
}

export class QueryValidationError extends Error {
  constructor(message: string) {
    super()
    this.message = message
  }
}

export class ParamsValidationError extends Error {
  constructor(message: string) {
    super()
    this.message = message
  }
}
