import { base64ToString, stringToBase64, serialize, deserialize } from './converter'

describe('Base64', () => {
  it('stringToBase64 should convert string to base64', () => {
    const receivedValue = stringToBase64('string to base64')
    const expectedValue = 'c3RyaW5nIHRvIGJhc2U2NA=='
    expect(receivedValue).toEqual(expectedValue)
  })

  it('base64ToString should convert base64 to string', () => {
    const receivedValue = base64ToString('c3RyaW5nIHRvIGJhc2U2NA==')
    const expectedValue = 'string to base64'
    expect(receivedValue).toEqual(expectedValue)
  })
})

describe('serialize', () => {
  it('serialize should convert data to string', () => {
    const data = { login: 'johndoe', name: 'John Doe' }
    const expectedValue = '{"login":"johndoe","name":"John Doe"}'
    const receivedValue = serialize(data)
    expect(receivedValue).toEqual(expectedValue)
  })

  it('deserialize should convert string to data', () => {
    const data = '{"login":"johndoe","name":"John Doe"}'
    const expectedValue = { login: 'johndoe', name: 'John Doe' }
    const receivedValue = deserialize(data)
    expect(receivedValue).toEqual(expectedValue)
  })
})
