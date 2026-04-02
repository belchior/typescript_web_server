import { createApp } from '../../../src/infrastructure/graphql_server/server'
import { graphqlRequest } from '../../util/client'
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

    const query = `
      {
        user(login: "${login}") {
          avatarUrl
          bio
          company
          email
          id
          location
          login
          name
          url
          websiteUrl
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          avatarUrl: user.avatar_url,
          bio: user.bio,
          company: user.company,
          email: user.email,
          id: `us_${user.user_id}`,
          location: user.location,
          login: user.login,
          name: user.name,
          url: user.url,
          websiteUrl: user.website_url,
        },
      },
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

    const query = `
      {
        user(login: "${userLogin}") {
          followers(first: 1) {
            edges {
              node {
                name
                login
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: {
            edges: [
              {
                node: {
                  login: follower.login,
                  name: follower.name,
                },
              },
            ],
          },
        },
      },
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

    const query = `
      {
        user(login: "${userLogin}") {
          following(first: 1) {
            edges {
              node {
                name
                login
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: {
            edges: [
              {
                node: {
                  login: following.login,
                  name: following.name,
                },
              },
            ],
          },
        },
      },
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

    const query = `
      {
        user(login: "${userLogin}") {
          organizations(first: 1) {
            edges {
              node {
                name
                login
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: {
            edges: [
              {
                node: {
                  login: organization.login,
                  name: organization.name,
                },
              },
            ],
          },
        },
      },
    }))
  })

  it('should fetch repositories of the user', async () => {
    const suffix = randomId()
    const userLogin = `user_${suffix}`

    const [, repository] = await Promise.all([
      mockHelper.insertUser(suffix, { login: userLogin }),
      mockHelper.insertRepository(suffix, { owner_login: userLogin, owner_ref: 'users' }),
    ])

    const query = `
      {
        user(login: "${userLogin}") {
          repositories(first: 1) {
            edges {
              node {
                name
                id
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: {
            edges: [
              {
                node: {
                  id: `re_${repository.repository_id}`,
                  name: repository.name,
                },
              },
            ],
          },
        },
      },
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

    const query = `
      {
        user(login: "${userLogin}") {
          starredRepositories(first: 1) {
            edges {
              node {
                name
                id
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: {
            edges: [
              {
                node: {
                  id: `re_${repo.repository_id}`,
                  name: repo.name,
                },
              },
            ],
          },
        },
      },
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

    const query = `
      { user(login: "${login}") { followers(first: ${pageLimit}) { edges { node { login } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: {
            edges: [
              { node: { login: followers.at(0)?.login } },
              { node: { login: followers.at(1)?.login } },
            ],
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { followers(first: ${pageLimit}) { 
        edges { node { login } } 
        pageInfo { hasNextPage, endCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: expect.objectContaining({
            edges: [
              { node: { login: followers.at(0)?.login } },
              { node: { login: followers.at(1)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: true,
            }),
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.user.followers.pageInfo
    query = `
      { user(login: "${login}") { followers(first: ${pageLimit}, after: "${endCursor}") { 
        edges { node { login } }
        pageInfo { hasNextPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: {
            edges: [
              { node: { login: followers.at(2)?.login } },
            ],
            pageInfo: {
              hasNextPage: false,
            },
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { followers(last: ${pageLimit}) { 
        edges { node { login } } 
        pageInfo { hasPreviousPage, startCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: expect.objectContaining({
            edges: [
              { node: { login: followers.at(1)?.login } },
              { node: { login: followers.at(2)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: true,
            }),
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.user.followers.pageInfo
    query = `
      { user(login: "${login}") { followers(last: ${pageLimit}, before: "${startCursor}") { 
        edges { node { login } }
        pageInfo { hasPreviousPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          followers: {
            edges: [
              { node: { login: followers.at(0)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: false,
            }),
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the user does not have followers', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      { user(login: "${login}") { followers(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.followers.edges).toHaveLength(0)
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

    const query = `
      { user(login: "${login}") { following(first: ${pageLimit}) { edges { node { login } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: {
            edges: [
              { node: { login: following.at(0)?.login } },
              { node: { login: following.at(1)?.login } },
            ],
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { following(first: ${pageLimit}) { 
        edges { node { login } } 
        pageInfo { hasNextPage, endCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: expect.objectContaining({
            edges: [
              { node: { login: following.at(0)?.login } },
              { node: { login: following.at(1)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: true,
            }),
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.user.following.pageInfo
    query = `
      { user(login: "${login}") { following(first: ${pageLimit}, after: "${endCursor}") { 
        edges { node { login } }
        pageInfo { hasNextPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: {
            edges: [
              { node: { login: following.at(2)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: false,
            }),
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { following(last: ${pageLimit}) { 
        edges { node { login } } 
        pageInfo { hasPreviousPage, startCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: expect.objectContaining({
            edges: [
              { node: { login: following.at(1)?.login } },
              { node: { login: following.at(2)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: true,
            }),
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.user.following.pageInfo
    query = `
      { user(login: "${login}") { following(last: ${pageLimit}, before: "${startCursor}") { 
        edges { node { login } }
        pageInfo { hasPreviousPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          following: {
            edges: [
              { node: { login: following.at(0)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: false,
            }),
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the user is not following other users', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      { user(login: "${login}") { following(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.following.edges).toHaveLength(0)
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

    const query = `
      { user(login: "${login}") { organizations(first: ${pageLimit}) { edges { node { login } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: {
            edges: [
              { node: { login: orgs.at(0)?.login } },
              { node: { login: orgs.at(1)?.login } },
            ],
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { organizations(first: ${pageLimit}) { 
        pageInfo { hasNextPage, endCursor }
        edges { node { login } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: expect.objectContaining({
            edges: [
              { node: { login: orgs.at(0)?.login } },
              { node: { login: orgs.at(1)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: true,
            }),
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.user.organizations.pageInfo
    query = `
      { user(login: "${login}") { organizations(first: ${pageLimit}, after: "${endCursor}") { 
        edges { node { login } }
        pageInfo { hasNextPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: {
            edges: [
              { node: { login: orgs.at(2)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: false,
            }),
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { organizations(last: ${pageLimit}) { 
        edges { node { login } } 
        pageInfo { hasPreviousPage, startCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: expect.objectContaining({
            edges: [
              { node: { login: orgs.at(1)?.login } },
              { node: { login: orgs.at(2)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: true,
            }),
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.user.organizations.pageInfo
    query = `
      { user(login: "${login}") { organizations(last: ${pageLimit}, before: "${startCursor}") { 
        edges { node { login } }
        pageInfo { hasPreviousPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          organizations: {
            edges: [
              { node: { login: orgs.at(0)?.login } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: false,
            }),
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the user is not member of an organization', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      { user(login: "${login}") { organizations(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.organizations.edges).toHaveLength(0)
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

    const query = `
      { user(login: "${login}") { repositories(first: ${pageLimit}) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: {
            edges: [
              { node: { name: repos.at(0)?.name } },
              { node: { name: repos.at(1)?.name } },
            ],
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { repositories(first: ${pageLimit}) { 
        edges { node { name } } 
        pageInfo { hasNextPage, endCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(0)?.name } },
              { node: { name: repos.at(1)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: true,
            }),
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.user.repositories.pageInfo
    query = `
      { user(login: "${login}") { repositories(first: ${pageLimit}, after: "${endCursor}") { 
        pageInfo { hasNextPage }
        edges { node { name } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: {
            edges: [
              { node: { name: repos.at(2)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: false,
            }),
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { repositories(last: ${pageLimit}) { 
        edges { node { name } } 
        pageInfo { hasPreviousPage, startCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(1)?.name } },
              { node: { name: repos.at(2)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: true,
            }),
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.user.repositories.pageInfo
    query = `
      { user(login: "${login}") { repositories(last: ${pageLimit}, before: "${startCursor}") { 
        edges { node { name } }
        pageInfo { hasPreviousPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          repositories: {
            edges: [
              { node: { name: repos.at(0)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasPreviousPage: false,
            }),
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the user does not have repositories', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      { user(login: "${login}") { repositories(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.repositories.edges).toHaveLength(0)
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

    const query = `
      { user(login: "${login}") { starredRepositories(first: ${pageLimit}) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: {
            edges: [
              { node: { name: repos.at(0)?.name } },
              { node: { name: repos.at(1)?.name } },
            ],
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { starredRepositories(first: ${pageLimit}) { 
        edges { node { name } } 
        pageInfo { hasNextPage, endCursor }
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(0)?.name } },
              { node: { name: repos.at(1)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: true,
            }),
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.user.starredRepositories.pageInfo
    query = `
      { user(login: "${login}") { starredRepositories(first: ${pageLimit}, after: "${endCursor}") { 
        edges { node { name } }
        pageInfo { hasNextPage }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: {
            edges: [
              { node: { name: repos.at(2)?.name } },
            ],
            pageInfo: expect.objectContaining({
              hasNextPage: false,
            }),
          },
        },
      },
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

    let query = `
      { user(login: "${login}") { starredRepositories(last: ${pageLimit}) { 
        pageInfo { startCursor }
        edges { node { name } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(1)?.name } },
              { node: { name: repos.at(2)?.name } },
            ],
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.user.starredRepositories.pageInfo
    query = `
      { user(login: "${login}") { starredRepositories(last: ${pageLimit}, before: "${startCursor}") { 
        pageInfo { hasPreviousPage }
        edges { node { name } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        user: {
          starredRepositories: {
            pageInfo: {
              hasPreviousPage: false,
            },
            edges: [
              { node: { name: repos.at(0)?.name } },
            ],
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the user does not have starred repositories', async () => {
    const suffix = randomId()
    const login = `user_${suffix}`
    await Promise.all([
      mockHelper.insertUser(suffix, { login }),
    ])

    const query = `
      { user(login: "${login}") { starredRepositories(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.user.starredRepositories.edges).toHaveLength(0)
  })
})