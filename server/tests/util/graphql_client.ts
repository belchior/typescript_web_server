import e from 'express'
import request from 'supertest'

export async function graphqlRequest(app: e.Express, query: string) {
  return request(app)
    .post('/graphql')
    .set('content-type', 'application/json')
    .set('Accept', 'application/json')
    .send({ query })
}