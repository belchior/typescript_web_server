
export const stringToBase64 = (str: string) => {
  const buff = Buffer.from(String(str), 'utf-8')
  return buff.toString('base64')
}

export const base64ToString = (base64: string) => {
  const buff = Buffer.from(base64, 'base64')
  return buff.toString('utf-8')
}

export const serialize = <T>(data: T) => JSON.stringify(data)

export const deserialize = <T>(serialized: string): T => JSON.parse(serialized)
