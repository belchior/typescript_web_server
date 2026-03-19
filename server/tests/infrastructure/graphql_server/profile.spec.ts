import { createApp } from '../../../src/infrastructure/graphql_server/server'
import { graphqlRequest } from '../../util/graphql_client'
import { randomId } from '../../util/random'
import * as db from '../../../src/infrastructure/database/db_connection'
import * as mockHelper from '../../util/mocked_data'

describe('Profile', () => {
  const app = createApp()

  beforeAll(async () => {
    await db.dbConnect()
  })

  afterAll(async () => {
    await db.dbDisconnect()
  })

  it('should fetch the organization by login', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`

    const [organization] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const query = `
      {
        profile(login: "${login}") {
          login
          name
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        profile: {
          login: organization.login,
          name: organization.name,
        },
      },
    }))
  })

  it('should fetch the user by login', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`

    const [user] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      {
        profile(login: "${login}") {
          login
          name
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        profile: {
          login: user.login,
          name: user.name,
        },
      },
    }))
  })
})