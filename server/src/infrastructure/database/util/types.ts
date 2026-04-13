import { ObjectId } from 'mongodb'
import { PageInfo } from '../../util/cursor_connection/cursor_connection'

export type Colls = 'users' | 'organizations' | 'repositories'

export type CollRef<T extends Colls> = {
  _id?: ObjectId
  created_at: Date
  login?: string
  ref: T
}

export type Project<T> = Record<keyof T, string | 0 | 1>

export type TableNames =
  | 'organizations_members'
  | 'organizations'
  | 'repositories_licenses'
  | 'repositories_stars'
  | 'repositories'
  | 'users_following'
  | 'users'

export type PageInfoItem = {
  row: 'prev' | 'next'
}

export type ReferenceFrom<T> = (item: T) => string
export type HasPage = Pick<PageInfo, 'hasPreviousPage' | 'hasNextPage'>
