import { createApp } from '../../../src/infrastructure/http_server/server'
import { httpRequest } from '../../util/client'
import { randomId } from '../../util/random'
import database from '../../../src/infrastructure/database'
import * as mockHelper from '../../util/mocked_data'

describe('Profile', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should fetch the organization by login', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`

    const [organization] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const url = `/profile/${login}`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      login: organization.login,
      name: organization.name,
    }))
  })

  it('should fetch the user by login', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`

    const [user] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/profile/${login}`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      login: user.login,
      name: user.name,
    }))
  })
})