import * as organization from './organization'
import * as user from './user'

export async function findProfile(login: string) {
  const result = await Promise.allSettled([
    organization.findOrganization(login),
    user.findUser(login),
  ])

  const item = result
    .filter(item => item.status === 'fulfilled')
    .find(item => item.value != null)

  return item?.value
}
