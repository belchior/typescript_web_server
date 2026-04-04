import { createApp } from '../../../src/infrastructure/http_server/server'
import { httpRequest } from '../../util/client'
import { randomId } from '../../util/random'
import * as mockHelper from '../../util/mocked_data'
import database from '../../../src/infrastructure/database'

describe('User', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should fetch the user by login', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`

    const [user] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      avatar_url: user.avatar_url,
      bio: user.bio,
      company: user.company,
      email: user.email,
      user_id: user.user_id,
      location: user.location,
      login: user.login,
      name: user.name,
      url: user.url,
      website_url: user.website_url,
    }))
  })

  it('should fetch users followers', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`
    const followerLogin = `follower_${suffix}`

    const [, follower] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertUser(suffix, { login: followerLogin }),
    ])
    await mockHelper.insertUsersFollowing([{
      user_login: followerLogin,
      following_login: userLogin,
    }])

    const url = `/user/${userLogin}/followers?first=2`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: follower.login,
            name: follower.name,
          }),
        }),
      ],
    }))
  })

  it('should fetch people that user is following', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`
    const followingLogin = `following_${suffix}`

    const [, following] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertUser(suffix, { login: followingLogin }),
    ])
    await mockHelper.insertUsersFollowing([{
      user_login: userLogin,
      following_login: followingLogin,
    }])

    const url = `/user/${userLogin}/following?first=2`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.login,
            name: following.name,
          }),
        }),
      ],
    }))
  })

  it('should fetch organizations that the user is member', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`
    const organizationLogin = `org_${suffix}`

    const [, organization] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertOrganization(suffix, { login: organizationLogin }),
    ])
    await mockHelper.insertOrganizationsMembers([
      { user_login: userLogin, organization_login: organizationLogin },
    ])

    const url = `/user/${userLogin}/organizations?first=2`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: organization.login,
            name: organization.name,
          }),
        }),
      ],
    }))
  })

  it('should fetch repositories of the user', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`

    const [, repository] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertRepository(suffix, { owner_login: userLogin, owner_ref: 'users' }),
    ])

    const url = `/user/${userLogin}/repositories?first=2`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            repository_id: repository.repository_id,
            name: repository.name,
          }),
        }),
      ],
    }))
  })

  it('should fetch repositories that the user starred', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`

    const [, repo] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertRepository(suffix, { owner_login: userLogin, owner_ref: 'users' }),
    ])
    await mockHelper.insertUsersStarredRepositories([{
      repository_id: repo.repository_id,
      owner_login: userLogin,
    }])

    const url = `/user/${userLogin}/stars?first=2`
    const response = await httpRequest(app, url)

    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            repository_id: repo.repository_id,
            name: repo.name,
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

  it('should limits the number of users on the pages that will be retrieved from the user followers list', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    const url = `/user/${login}/followers?first=${pageLimit}`
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

  it('should advance to the next page respecting the limit and order of the user followers list', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/followers?first=${pageLimit}`
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
    url = `/user/${login}/followers?first=${pageLimit}&after=${endCursor}`
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
    const login = `user_${suffix}`
    const [, ...followers] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(followers.map(user => ({
      user_login: user.login,
      following_login: login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/followers?last=${pageLimit}`
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
    url = `/user/${login}/followers?last=${pageLimit}&before=${startCursor}`
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

  it('should retrieve an empty list when the user does not have followers', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}/followers?first=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})

describe('Following Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of users on the pages that will be retrieved from the user following list', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...following] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(following.map(user => ({
      user_login: login,
      following_login: user.login,
    })))

    const pageLimit = 2

    const url = `/user/${login}/following?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(1)?.login,
          }),
        }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the following', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...following] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(following.map(user => ({
      user_login: login,
      following_login: user.login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/following?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(0)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(1)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/user/${login}/following?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last following should be in the first page', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...following] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersFollowing(following.map(user => ({
      user_login: login,
      following_login: user.login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/following?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(1)?.login,
          }),
        }),
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(2)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: true,
      }),
    }))

    const { startCursor } = response.body.pageInfo
    url = `/user/${login}/following?last=${pageLimit}&before=${startCursor}`

    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({
          node: expect.objectContaining({
            login: following.at(0)?.login,
          }),
        }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: false,
      }),
    }))
  })

  it('should retrieve an empty list when the user is not following other users', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}/following?last=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})

describe('Organization Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of organizations on the pages that will be retrieved from the user organizations list', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...orgs] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertOrganization(suffix, { login: `org0_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org1_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(orgs.map(org => ({
      user_login: login,
      organization_login: org.login,
    })))

    const pageLimit = 2

    const url = `/user/${login}/organizations?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(0)?.login }) }),
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(1)?.login }) }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the organizations', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...orgs] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertOrganization(suffix, { login: `org0_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org1_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(orgs.map(org => ({
      user_login: login,
      organization_login: org.login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/organizations?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(0)?.login }) }),
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(1)?.login }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/user/${login}/organizations?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(2)?.login }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last organizations should be in the first page', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, ...orgs] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertOrganization(suffix, { login: `org0_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org1_${suffix}` }),
      mockHelper.insertOrganization(suffix, { login: `org2_${suffix}` }),
    ])
    await mockHelper.insertOrganizationsMembers(orgs.map(org => ({
      user_login: login,
      organization_login: org.login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/organizations?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(1)?.login }) }),
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(2)?.login }) }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: true,
      }),
    }))

    const { startCursor } = response.body.pageInfo
    url = `/user/${login}/organizations?last=${pageLimit}&before=${startCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ login: orgs.at(0)?.login }) }),
      ],
      pageInfo: expect.objectContaining({
        hasPreviousPage: false,
      }),
    }))
  })

  it('should retrieve an empty list when the user is not member of an organization', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}/organizations?first=2`
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

  it('should limits the number of repositories on the pages that will be retrieved from the user', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'users' },
      ]),
    ])

    const pageLimit = 2

    const url = `/user/${login}/repositories?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(0)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the repos', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'users' },
      ]),
    ])

    const pageLimit = 2

    let url = `/user/${login}/repositories?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(0)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/user/${login}/repositories?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(2)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last repository should be in the first page', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: login, owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: login, owner_ref: 'users' },
      ]),
    ])

    const pageLimit = 2

    let url = `/user/${login}/repositories?last=${pageLimit}`
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
    url = `/user/${login}/repositories?last=${pageLimit}&before=${startCursor}`
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

  it('should retrieve an empty list when the user does not have repositories', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}/repositories?first=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})

describe('Starred Repository Pagination', () => {
  const app = createApp()

  beforeAll(async () => {
    await database.dbConnect()
  })

  afterAll(async () => {
    await database.dbDisconnect()
  })

  it('should limits the number of starred repositories on the pages that will be retrieved from the user', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
      ]),
    ])
    await mockHelper.insertUsersStarredRepositories(repos.map(repo => ({
      repository_id: repo.repository_id,
      owner_login: login,
    })))

    const pageLimit = 2

    const url = `/user/${login}/stars?first=${pageLimit}`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(0)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
      ],
    }))
  })

  it('should advance to the next page respecting the limit and order of the repos', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
      ]),
    ])
    await mockHelper.insertUsersStarredRepositories(repos.map(repo => ({
      repository_id: repo.repository_id,
      owner_login: login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/stars?first=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(0)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: true,
      }),
    }))

    const { endCursor } = response.body.pageInfo
    url = `/user/${login}/stars?first=${pageLimit}&after=${endCursor}`
    response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(2)?.name }) }),
      ],
      pageInfo: expect.objectContaining({
        hasNextPage: false,
      }),
    }))
  })

  it('should advance to the next page in inverse order where the last repository should be in the first page', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    const [, repos] = await Promise.all([
      mockHelper.insertUser(suffix, { login }),
      mockHelper.insertRepositories(suffix, [
        { name: `repo0_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo1_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
        { name: `repo2_${suffix}`, owner_login: 'other_user', owner_ref: 'users' },
      ]),
    ])
    await mockHelper.insertUsersStarredRepositories(repos.map(repo => ({
      repository_id: repo.repository_id,
      owner_login: login,
    })))

    const pageLimit = 2

    let url = `/user/${login}/stars?last=${pageLimit}`
    let response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      edges: [
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(1)?.name }) }),
        expect.objectContaining({ node: expect.objectContaining({ name: repos.at(2)?.name }) }),
      ],
    }))

    const { startCursor } = response.body.pageInfo
    url = `/user/${login}/stars?last=${pageLimit}&before=${startCursor}`
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

  it('should retrieve an empty list when the user does not have starred repositories', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const url = `/user/${login}/stars?first=2`
    const response = await httpRequest(app, url)

    expect(response.body.edges).toHaveLength(0)
  })
})