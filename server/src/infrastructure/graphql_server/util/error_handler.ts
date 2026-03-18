import { GraphQLError } from 'graphql'

import envs from '../../util/environment'

export const handleError = (error: Error) => {
  if (envs.NODE_ENV !== 'test') console.error(error)
  return Promise.reject(new GraphQLError(error.message))
}

export const handleNotFound = (message: string) => async (data: unknown) => {
  if (data == undefined || (Array.isArray(data) && data.length === 0)) {
    return handleError(new Error(message))
  }
  return data
}
