import { GraphQLError } from 'graphql'

import { handleError, handleNotFound } from './error_handler'

describe('Error handlers', () => {
  describe('handleError', () => {
    it('should return rejected promise with a graphql error instance', async () => {
      const error = new Error('test error')
      const promise = handleError(error as Error)
      await expect(promise).rejects.toThrow(GraphQLError)
    })
  })

  describe('handleNotFound', () => {
    it('should return rejected promise when data is invalid or empty array', async () => {
      const message = 'not found'
      let data: unknown = undefined
      let promise = handleNotFound(message)(data)
      await expect(promise).rejects.toThrow(message)

      data = []
      promise = handleNotFound(message)(data)
      await expect(promise).rejects.toThrow(message)
    })

    it('should return the data argument when it is valid', async () => {
      const message = 'not found'
      let data: unknown = { name: 'test handleNotFound' }
      let promise = handleNotFound(message)(data)
      await expect(promise).resolves.toEqual(data)

      data = [{ name: 'test handleNotFound' }]
      promise = handleNotFound(message)(data)
      await expect(promise).resolves.toEqual(data)
    })
  })
})
