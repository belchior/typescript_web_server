
import { isISOString } from './date'

describe('isISOString', () => {
  it('should verify if the value provided math to ISO 8601, a value similar to `new Date().toISOString()`', () => {
    let value = '2020-07-15T16:18:26.479Z'
    expect(isISOString(value)).toBe(true)

    value = '2020-07-15 16:18:26'
    expect(isISOString(value)).toBe(false)
  })
})
