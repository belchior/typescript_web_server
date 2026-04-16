import request from 'supertest'
import { FastifyInstance } from 'fastify'

export async function httpRequest(app: FastifyInstance, urlPath: string) {
  await app.ready()
  return request(app.server)
    .get(urlPath)
    .set('Accept', 'application/json')
}
