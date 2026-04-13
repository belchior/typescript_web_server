import {
  FollowerDocView,
  FollowingDocView,
  OrganizationMemberDocView,
  OrganizationDocView,
  RepositoryDocument,
  UserOrganizationDocView,
  UserDocView,
} from '../../infrastructure/database'

export type Follower = User & {
  followed_at: Date
}
export function toFollower(doc: FollowerDocView) {
  return toUser(doc) as Follower
}

export type Following = (User | Organization) & {
  following_at: Date
}
export function toFollowing(doc: FollowingDocView) {
  const data = structuredClone(doc) as Record<string, unknown>
  delete data._id
  delete data.ref

  if (doc.ref === 'organizations') {
    data.organization_id = doc._id.toHexString()
  }
  if (doc.ref === 'users') {
    data.user_id = doc._id.toHexString()
  }

  return data as Following
}

export type Organization = Omit<OrganizationDocView, '_id' | 'ref'> & {
  organization_id: string
}
export function toOrganization(doc: OrganizationDocView) {
  const data = structuredClone(doc) as Record<string, unknown>
  delete data._id
  delete data.ref

  data.organization_id = doc._id.toHexString()

  return data as Organization
}

export type OrganizationMember = User & {
  joined_at: Date
}
export function toOrganizationMember(doc: OrganizationMemberDocView) {
  return toUser(doc) as OrganizationMember
}

type RepositoryPropsToOmit =
 | '_id'
 | 'license_info'
 | 'owner'
 | 'primary_language'
export type Repository = Omit<RepositoryDocument, RepositoryPropsToOmit> & {
  language_color: string
  language_name: string
  license_name: string
  owner_login: string
  owner_ref: string
  repository_id: string
}
export function toRepository(doc: RepositoryDocument) {
  const data = structuredClone(doc) as Record<string, unknown>
  delete data._id
  delete data.license_info
  delete data.owner
  delete data.primary_language

  data.language_color = doc.primary_language.color
  data.language_name = doc.primary_language.name
  data.license_name = doc.license_info.name
  data.owner_login = doc.owner.login
  data.owner_ref = doc.owner.ref
  data.repository_id = doc._id.toHexString()

  return data as Repository
}

export type StarredRepository = Repository & {
  starred_at: Date
}
export function toStarredRepository(doc: RepositoryDocument) {
  return toRepository(doc) as StarredRepository
}

export type User = Omit<UserDocView, '_id' | 'ref'> & {
  user_id: string
}
export function toUser(doc: UserDocView) {
  const data = structuredClone(doc) as Record<string, unknown>
  delete data._id
  delete data.ref

  data.user_id = doc._id.toHexString()

  return data as User
}

export type UserOrganization = Organization & {
  joined_at: Date
}
export function toUserOrganization(doc: UserOrganizationDocView) {
  return toOrganization(doc) as UserOrganization
}
