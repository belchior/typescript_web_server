import List, { type PaginationControl } from '../../../../designSystem/List/List'
import type { ProfileOwnerType } from '../../../../util/types'
import ProfileOwnerItem from './ProfileOwnerItem'

export type ProfileOwner = {
  __typename: ProfileOwnerType
  avatarUrl: string
  id: string
  location?: string
  login: string
  name?: string
  url: string
}

type ProfileOwnerListProps = {
  items: ProfileOwner[]
  paginationCtrl: PaginationControl
}

export default function ProfileOwnerList(props: ProfileOwnerListProps) {
  return (
    <List paginationCtrl={props.paginationCtrl}>
      {props.items.map(owner => <ProfileOwnerItem key={owner.id} owner={owner} />)}
    </List>
  )
}
