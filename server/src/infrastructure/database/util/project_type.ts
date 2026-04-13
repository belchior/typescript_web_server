import { OrganizationMemberDocView, OrganizationDocView } from '../model/organization'
import { FollowerDocView } from '../model/profile'
import { RepositoryDocument } from '../model/repository'
import { StarredRepository, UserOrganizationDocView, UserDocView } from '../model/user'

type Project<T> = Record<keyof T, string | 0 | 1>

export function projectFollower() {
  const project: Project<FollowerDocView> = {
    _id: 1,
    avatar_url: 1,
    bio: 1,
    company: 1,
    created_at: 1,
    email: 1,
    followed_at: 1,
    location: 1,
    login: 1,
    members: 1,
    name: 1,
    ref: 'users',
    url: 1,
    website_url: 1,
  }

  return project
}

export function projectOrganizationMember() {
  const project: Project<OrganizationMemberDocView> = {
    _id: 1,
    avatar_url: 1,
    bio: 1,
    company: 1,
    created_at: 1,
    email: 1,
    joined_at: 1,
    location: 1,
    login: 1,
    members: 1,
    name: 1,
    ref: 'users',
    url: 1,
    website_url: 1,
  }

  return project
}

export function projectOrganizationDocView() {
  const project: Project<OrganizationDocView> = {
    avatar_url: 1,
    created_at: 1,
    description: 1,
    email: 1,
    location: 1,
    login: 1,
    name: 1,
    url: 1,
    website_url: 1,
    ref: 'organizations',
  }

  return project
}

export function projectRepositoryDocument() {
  const project: Project<RepositoryDocument> = {
    _id: 1,
    created_at: 1,
    description: 1,
    fork_count: 1,
    license_info: 1,
    name: 1,
    owner: 1,
    primary_language: 1,
    star_count: 1,
    url: 1,
  }

  return project
}

export function projectStarredRepository() {
  const project: Project<StarredRepository> = {
    _id: 1,
    created_at: 1,
    description: 1,
    fork_count: 1,
    license_info: 1,
    name: 1,
    owner: 1,
    primary_language: 1,
    star_count: 1,
    starred_at: 1,
    url: 1,
  }

  return project
}

export function projectUserDocView() {
  const project: Project<UserDocView> = {
    _id: 1,
    avatar_url: 1,
    bio: 1,
    company: 1,
    created_at: 1,
    email: 1,
    location: 1,
    login: 1,
    name: 1,
    ref: 'users',
    url: 1,
    website_url: 1,
  }

  return project
}

export function projectUserOrganization() {
  const project: Project<UserOrganizationDocView> = {
    _id: 1,
    avatar_url: 1,
    created_at: 1,
    description: 1,
    email: 1,
    joined_at: 1,
    location: 1,
    login: 1,
    name: 1,
    url: 1,
    website_url: 1,
    ref: 1,
  }

  return project
}
