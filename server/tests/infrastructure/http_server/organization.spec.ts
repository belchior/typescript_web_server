import { createApp } from '../../../src/infrastructure/http_server/server'
import { httpRequest } from '../../util/client'
import { randomId } from '../../util/random'
import * as mockHelper from '../../util/mocked_data'
import database from '../../../src/infrastructure/database'

describe('Organization', () => {
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

    const url = `/organization/${login}`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      avatar_url: organization.avatar_url,
      created_at: organization.created_at.toISOString(),
      description: organization.description,
      email: organization.email,
      organization_id: organization.organization_id,
      location: organization.location,
      login: organization.login,
      name: organization.name,
      url: organization.url,
      website_url: organization.website_url,
    }))
  })

  it('should fetch the organization followers', async () => {
    const suffix = randomId()
    const organizationLogin = `org_${suffix}`
    const userLogin = `user_${suffix}`

    const [, user] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login: organizationLogin }),
      mockHelper.insertUser(suffix, { login: userLogin }),
    ])
    const [followingData] = await mockHelper.insertUsersFollowing([{
      user_login: userLogin,
      following_login: organizationLogin,
    }])

    const url = `/organization/${organizationLogin}/followers?first=10`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            avatar_url: user.avatar_url,
            bio: user.bio,
            company: user.company,
            created_at: user.created_at.toISOString(),
            email: user.email,
            location: user.location,
            login: user.login,
            name: user.name,
            url: user.url,
            user_id: user.user_id,
            website_url: user.website_url,
            follows_since: followingData?.created_at?.toISOString(),
          }),
        }),
      ],
    }))
  })

  it('should fetch the organization people', async () => {
    const suffix = randomId()
    const organizationLogin = `org_${suffix}`
    const userLogin = `user_${suffix}`

    const [, user] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login: organizationLogin }),
      mockHelper.insertUser(suffix, { login: userLogin }),
    ])
    await mockHelper.insertOrganizationsMembers([
      { user_login: userLogin, organization_login: organizationLogin },
    ])

    const url = `/organization/${organizationLogin}/people?first=10`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            name: user.name,
            login: user.login,
          }),
        }),
      ],
    }))
  })

  it('should fetch the organization repositories', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`

    const [, repository] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertRepository(suffix, { owner_login: login, owner_ref: 'organizations' }),
    ])

    const url = `/organization/${login}/repositories?first=10`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            description: repository.description,
            fork_count: repository.fork_count,
            language_color: repository.language_color,
            language_name: repository.language_name,
            license_key: repository.license_key,
            license_name: repository.license_name,
            name: repository.name,
            owner_login: repository.owner_login,
            owner_ref: repository.owner_ref,
            repository_id: repository.repository_id,
            url: repository.url,
          }),
        }),
      ],
    }))
  })
})

describe('Followers Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of followers on the pages that will be retrieved from the organization followers list', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    const url = `/organization/${login}/followers?first=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(1)?.login,
          }),
        }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the followers list', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    let url = `/organization/${login}/followers?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(1)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/organization/${login}/followers?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last followers should be in the first page', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    let url = `/organization/${login}/followers?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(1)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: true,
      }),
    }))

    const { startCursor } = response.body.pageInfo
    url = `/organization/${login}/followers?last=${pageLimit}&before=${startCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: followers.at(0)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: false,
      }),
    }))
  })

  it('should retrieve an empty list when the organization does not have followers', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const url = `/organization/${login}/followers?last=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})

describe('People Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of users on the pages that will be retrieved from the organization', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...users] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    const url = `/organization/${login}/people?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(1)?.login,
          }),
        }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the users', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...users] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    let url = `/organization/${login}/people?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(1)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/organization/${login}/people?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last members should be in the first page', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...users] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    let url = `/organization/${login}/people?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(1)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: true,
      }),
    }))

    const { startCursor } = response.body.pageInfo
    url = `/organization/${login}/people?last=${pageLimit}&before=${startCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: users.at(0)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: false,
      }),
    }))
  })

  it('should retrieve an empty list when the organization does not have users', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const url = `/organization/${login}/people?last=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})

describe('Repository Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of repositories on the pages that will be retrieved from the organization', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'organizations' },
      ]),
    ])

    const pageLimit = 2

    const url = `/organization/${login}/repositories?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            name: repos.at(0)?.name,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            name: repos.at(1)?.name,
          }),
        }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the repos', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'organizations' },
      ]),
    ])

    const pageLimit = 2

    let url = `/organization/${login}/repositories?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            name: repos.at(0)?.name,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            name: repos.at(1)?.name,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/organization/${login}/repositories?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            name: repos.at(2)?.name,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last members should be in the first page', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'organizations' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'organizations' },
      ]),
    ])

    const pageLimit = 2

    let url = `/organization/${login}/repositories?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(2)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: true,
      }),
    }))

    const { startCursor } = response.body.pageInfo
    url = `/organization/${login}/repositories?last=${pageLimit}&before=${startCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(0)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: false,
      }),
    }))
  })

  it('should retrieve an empty list when the organization does not have repositories', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const url = `/organization/${login}/repositories?first=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})