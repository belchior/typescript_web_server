import { createApp } from '../../../src/infrastructure/graphql_server/server'
import { graphqlRequest } from '../../util/graphql_client'
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
    const login = `foo_${suffix}`

    const [organization] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const query = `
      {
        organization(login: "${login}") {
          avatarUrl
          description
          email
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
        organization: {
          avatarUrl: organization.avatar_url,
          description: organization.description,
          email: organization.email,
          location: organization.location,
          login: organization.login,
          name: organization.name,
          url: organization.url,
          websiteUrl: organization.website_url,
        },
      },
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
    await mockHelper.insertUsersOrganizations([
      { user_login: userLogin, organization_login: organizationLogin },
    ])

    const query = `
      {
        organization(login: "${organizationLogin}") {
          people(first: 1) {
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
        organization: {
          people: {
            edges: [
              {
                node: {
                  name: user.name,
                  login: user.login,
                },
              },
            ],
          },
        },
      },
    }))
  })

  it('should fetch the organization repositories', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`

    const [, repository] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertRepository(suffix, { owner_login: login, owner_ref: 'organizations' }),
    ])

    const query = `
      {
        organization(login: "${login}") {
          repositories(first: 1) {
            edges {
              node {
                forkCount
                description
                id
                licenseInfo {
                  name
                }
                name
                owner {
                  login
                }
                primaryLanguage {
                  color
                  name
                }
                url
              }
            }
          }
        }
      }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          repositories: {
            edges: [
              {
                node: {
                  forkCount: repository.fork_count,
                  description: repository.description,
                  id: `repositories_${repository.repository_id}`,
                  licenseInfo: {
                    name: repository.license_name,
                  },
                  name: repository.name,
                  owner: {
                    login: repository.owner_login,
                  },
                  primaryLanguage: {
                    color: repository.language_color,
                    name: repository.language_name,
                  },
                  url: repository.url,
                },
              },
            ],
          },
        },
      },
    }))
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

  it('should limits the number of users of the pages that will be retrieved from the organization', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    const [, ...users] = await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
      mockHelper.insertUser(suffix, { login: `user0_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user1_${suffix}` }),
      mockHelper.insertUser(suffix, { login: `user2_${suffix}` }),
    ])
    await mockHelper.insertUsersOrganizations(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    const query = `
      { organization(login: "${login}") { people(first: ${pageLimit}) { edges { node { login } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          people: {
            edges: [
              { node: { login: users.at(0)?.login } },
              { node: { login: users.at(1)?.login } },
            ],
          },
        },
      },
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
    await mockHelper.insertUsersOrganizations(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    let query = `
      { organization(login: "${login}") { people(first: ${pageLimit}) { 
        pageInfo { endCursor }
        edges { node { login } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          people: expect.objectContaining({
            edges: [
              { node: { login: users.at(0)?.login } },
              { node: { login: users.at(1)?.login } },
            ],
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.organization.people.pageInfo
    query = `
      { organization(login: "${login}") { people(first: ${pageLimit}, after: "${endCursor}") { 
        pageInfo { hasNextPage }
        edges { node { login } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          people: {
            pageInfo: {
              hasNextPage: false,
            },
            edges: [
              { node: { login: users.at(2)?.login } },
            ],
          },
        },
      },
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
    await mockHelper.insertUsersOrganizations(users.map(user => ({
      user_login: user.login,
      organization_login: login,
    })))

    const pageLimit = 2

    let query = `
      { organization(login: "${login}") { people(last: ${pageLimit}) { 
        pageInfo { startCursor }
        edges { node { login } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          people: expect.objectContaining({
            edges: [
              { node: { login: users.at(1)?.login } },
              { node: { login: users.at(2)?.login } },
            ],
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.organization.people.pageInfo
    query = `
      { organization(login: "${login}") { people(last: ${pageLimit}, before: "${startCursor}") { 
        pageInfo { hasPreviousPage }
        edges { node { login } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          people: {
            pageInfo: {
              hasPreviousPage: false,
            },
            edges: [
              { node: { login: users.at(0)?.login } },
            ],
          },
        },
      },
    }))
  })

  it('should retrieve an empty list when the organization does not have users', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const query = `
      { organization(login: "${login}") { people(first: 2) { edges { node { login } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.organization.people.edges).toHaveLength(0)
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

  it('should limits the number of repositories of the pages that will be retrieved from the organization', async () => {
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

    const query = `
      { organization(login: "${login}") { repositories(first: ${pageLimit}) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
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

    let query = `
      { organization(login: "${login}") { repositories(first: ${pageLimit}) { 
        pageInfo { endCursor }
        edges { node { name } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          repositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(0)?.name } },
              { node: { name: repos.at(1)?.name } },
            ],
          }),
        },
      },
    }))

    const { endCursor } = response.body.data.organization.repositories.pageInfo
    query = `
      { organization(login: "${login}") { repositories(first: ${pageLimit}, after: "${endCursor}") { 
        pageInfo { hasNextPage }
        edges { node { name } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          repositories: {
            pageInfo: {
              hasNextPage: false,
            },
            edges: [
              { node: { name: repos.at(2)?.name } },
            ],
          },
        },
      },
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

    let query = `
      { organization(login: "${login}") { repositories(last: ${pageLimit}) { 
        pageInfo { startCursor }
        edges { node { name } } 
      } } }
    `
    let response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(pageLimit)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          repositories: expect.objectContaining({
            edges: [
              { node: { name: repos.at(1)?.name } },
              { node: { name: repos.at(2)?.name } },
            ],
          }),
        },
      },
    }))

    const { startCursor } = response.body.data.organization.repositories.pageInfo
    query = `
      { organization(login: "${login}") { repositories(last: ${pageLimit}, before: "${startCursor}") { 
        pageInfo { hasPreviousPage }
        edges { node { name } }
      } } }
    `

    response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(1)
    expect(response.body).toEqual(expect.objectContaining({
      data: {
        organization: {
          repositories: {
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

  it('should retrieve an empty list when the organization does not have repositories', async () => {
    const suffix = randomId()
    const login = `org_${suffix}`
    await Promise.all([
      mockHelper.insertOrganization(suffix, { login }),
    ])

    const query = `
      { organization(login: "${login}") { repositories(first: 2) { edges { node { name } } } } }
    `
    const response = await graphqlRequest(app, query)

    expect(response.body.data.organization.repositories.edges).toHaveLength(0)
  })
})