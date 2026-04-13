import * as organization from './organization'
import * as user from './user'

export async function findProfile(login: string) {
  const results = await Promise.allSettled([
    organization.findOneOrganization(login),
    user.findOneUser(login),
  ])

  const item = results
    .filter(item => item.status === 'fulfilled')
    .find(item => item.value != null)

  return item != null
    ? item.value
    : null
}
