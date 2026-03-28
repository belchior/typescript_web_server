import List, { type ListPagination } from '../../../../designSystem/List/List'
import ProfileOwnerItem from './ProfileOwnerItem'

export type ProfileOwnerType = 'User' | 'Organization' | 'Following'
export type ProfileOwner = {
  __typename: ProfileOwnerType
  avatarUrl: string
  location?: string
  login: string
  name?: string
  url: string
}

type ProfileOwnerListProps = {
  items: ProfileOwner[]
  pagination: ListPagination
}

export default function ProfileOwnerList(props: ProfileOwnerListProps) {
  return (
    <List pagination={props.pagination}>
      {props.items.map(owner => <ProfileOwnerItem key={owner.login} owner={owner} />)}
    </List>
  )
}
