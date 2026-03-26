
import { delay } from './delay'
import { randomInteger } from './random'
import database, {
  type User, Organization, Repository, TableNames,
} from '../../src/infrastructure/database'

function escapeData(data: Record<string, unknown>) {
  const keys = Object.keys(data)
  for (const key of keys) {
    if (key.startsWith('__')) {
      delete data[key]
    }
    if (typeof data[key] === 'string') {
      data[key] = `'${data[key]}'`
    }
    if (data[key] instanceof Date) {
      data[key] = `'${data[key].toISOString()}'`
    }
  }
  return data
}

function toSQLInsert(tableName: TableNames, data: Record<string, unknown>) {
  const columns = Object.keys(data).join(',')
  const values = Object.values(data).join(',')
  const query = `
    INSERT INTO ${tableName} (${columns})
    VALUES (${values})
    RETURNING *
  `
  return query.replace(/\n|\s+/g, ' ').trim()
}

async function insertLanguages() {
  const query = `
    INSERT INTO languages (language_name, language_color) 
    VALUES
      ('JavaScript','#f1e05a'),
      ('Python','#3572A5'),
      ('Rust', '#dea584'),
      ('Shell','#89e051'),
      ('TypeScript','#2b7489')
    ON CONFLICT DO NOTHING
  `

  await database.getConnection().query(query)
}

async function insertLicenses() {
  const query = `
    INSERT INTO licenses (license_key, license_name) 
    VALUES
      ('unlicense', 'The Unlicense'),
      ('mit', 'MIT License'),
      ('apache-2.0', 'Apache-2.0'),
      ('gpl-2.0', 'GPL-2.0'),
      ('gpl-3.0', 'GPL-3.0')
    ON CONFLICT DO NOTHING
  `

  await database.getConnection().query(query)
}

export async function insertOrganization(suffix: string, organization: Partial<Organization> = {})
  : Promise<Organization> {
  const data: Partial<Organization> = {
    avatar_url: `https://test.com/avatar_${suffix}.jpg`,
    description: `description_${suffix}`,
    email: `email_${suffix}@email.com`,
    location: `location_${suffix}`,
    login: `login_${suffix}`,
    name: `name_${suffix}`,
    url: `https://test.com/${suffix}`,
    website_url: `https://test.com/${suffix}`,
    ...organization,
  }

  const query = toSQLInsert('organizations', escapeData(data))
  const { rows } = await database.getConnection().query<Organization>(query)
  const result = rows.at(0)!
  return result
}

export async function insertRepository(suffix: string, repository: Partial<Repository> = {}): Promise<Repository> {
  const data: Partial<Repository> = {
    fork_count: randomInteger(10, 999),
    description: `description_${suffix}`,
    name: `name_${suffix}`,
    owner_login: `login_${suffix}`,
    owner_ref: 'users',
    primary_language: 'TypeScript',
    url: `https://test.com/${suffix}`,
    language_color: '#2b7489',
    language_name: 'TypeScript',
    license_key: 'mit',
    license_name: 'MIT License',
    ...repository,
  }

  // copy before delete
  const languageColor = data.language_color!
  const languageName = data.language_name!
  const licenseKey = data.license_key!
  const licenseName = data.license_name!

  // from table languages
  delete data.language_color
  delete data.language_name
  // from table licenses
  delete data.license_key
  delete data.license_name

  await Promise.all([
    insertLanguages(),
    insertLicenses(),
  ])

  const query = toSQLInsert('repositories', escapeData(data))
  const { rows } = await database.getConnection().query<Repository>(query)
  const repo = rows.at(0)!

  await insertRepositoriesLicenses({
    repository_id: repo.repository_id,
    license_key: licenseKey,
  })

  repo.language_color = languageColor
  repo.language_name = languageName
  repo.license_key = licenseKey
  repo.license_name = licenseName

  return repo
}

export async function insertRepositories(suffix: string, repositories: Partial<Repository>[]) {
  const results = []

  for (const data of repositories) {
    // needed to create repositories in a consistent order
    await delay(randomInteger(1, 10))
    const repo = await insertRepository(suffix, data)
    results.push(repo)
  }

  return results
}

type RepositoriesLicenses = {
  repository_id: Repository['repository_id']
  license_key: string
}
export async function insertRepositoriesLicenses(data: RepositoriesLicenses) {
  const query = toSQLInsert('repositories_licenses', escapeData(data))
  const { rows } = await database.getConnection().query<RepositoriesLicenses>(query)
  const result = rows.at(0)!
  return result
}

export async function insertUser(suffix: string, user: Partial<User> = {}): Promise<User> {
  const data: Partial<User> = {
    avatar_url: `https://test.com/avatar_${suffix}.jpg`,
    bio: `bio_${suffix}`,
    company: `company_${suffix}`,
    email: `email_${suffix}@email.com`,
    location: `location_${suffix}`,
    login: `login_${suffix}`,
    name: `name_${suffix}`,
    url: `https://test.com/${suffix}`,
    website_url: `https://test.com/${suffix}`,
    ...user,
  }

  const query = toSQLInsert('users', escapeData(data))
  const { rows } = await database.getConnection().query<User & { user_id: string }>(query)
  const result = rows.at(0)!
  return result
}

type UsersFollowing = {
  user_login: User['login'],
  following_login: User['login'],
}
export async function insertUsersFollowing(list: UsersFollowing[]) {
  const results = []

  for (const data of list) {
    // needed to bind following user in a consistent order
    await delay(randomInteger(1, 10))
    const query = toSQLInsert('users_following', escapeData(data))
    const { rows } = await database.getConnection().query<UsersFollowing>(query)
    results.push(rows.at(0)!)
  }

  return results
}

type OrganizationsMembers = {
  organization_login: Organization['login'],
  user_login: User['login'],
}
export async function insertOrganizationsMembers(list: OrganizationsMembers[]) {
  const results = []

  for (const data of list) {
    // needed to bind user to an org in a consistent order
    await delay(randomInteger(1, 10))
    const query = toSQLInsert('organizations_members', escapeData(data))
    const { rows } = await database.getConnection().query<OrganizationsMembers>(query)
    results.push(rows.at(0)!)
  }

  return results
}

type TRepositoriesStars = {
  owner_login: User['login'] | Organization['login'],
  repository_id: Repository['repository_id'],
}
export async function insertUsersStarredRepositories(list: TRepositoriesStars[]) {
  const results = []

  for (const data of list) {
    // needed to bind star a repositories in a consistent order
    await delay(randomInteger(1, 10))
    const query = toSQLInsert('repositories_stars', escapeData(data))
    const { rows } = await database.getConnection().query<TRepositoriesStars>(query)
    results.push(rows.at(0)!)
  }

  return results
}