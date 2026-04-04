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