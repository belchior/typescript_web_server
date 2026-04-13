import e from 'express'
import request from 'supertest'

export async function httpRequest(app: e.Express, urlPath: string) {
  return request(app)
    .get(urlPath)
    .set('Accept', 'application/json')
}
