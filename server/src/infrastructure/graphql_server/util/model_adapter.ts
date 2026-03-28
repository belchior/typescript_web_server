import { Organization, User } from '../../database'
import { OwnerIdentity } from '../../database/model/profileOwner'

export function modelId(id: string) {
  const mId = Number(id.replace(/^\w+_/, ''))
  if (Number.isNaN(mId) || mId <= 0 || Number.isSafeInteger(mId) === false) {
    throw new Error('The provided id can not be converted to model id')
  }
  return mId.toString()
}

export function addTypename(ownerIdentity: OwnerIdentity, owner: User | Organization) {
  const map = {
    'organizations': 'Organization',
    'users': 'User',
  }
  // @ts-expect-error The Node interface needs a typename to handle the final type
  owner.__typename = map[ownerIdentity.owner_ref]
  return owner
}