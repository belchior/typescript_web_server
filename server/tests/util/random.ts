import { randomInt, randomUUID } from 'node:crypto'

export function randomInteger(min: number, max: number) {
  return randomInt(min, max)
}

export function randomId(prefix?: string) {
  return prefix
    ? `${prefix}_${randomUUID()}`
    : randomUUID()
}