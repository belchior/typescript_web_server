import { Response } from 'express'
import logger from '../../util/logger'

export type ErrorBody = {
  errors: string[]
}
export type ResponseError<T extends ErrorBody = ErrorBody> = Response<T>

type ErrorContext<T extends ErrorBody> = {
  error: Error
  res: ResponseError<T>
  status?: number
  message?: string
}
export function responseError(args: ErrorContext<ErrorBody>) {
  const { error, res, status = 500, message } = args
  const finalMessage = message ?? error?.message

  logger.error({
    message: message ?? undefined,
    error: {
      message: error?.message,
    },
  })

  res.status(status).json({
    errors: [finalMessage],
  })
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