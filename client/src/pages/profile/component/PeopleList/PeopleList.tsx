import List, { type PaginationControl } from '../../../../designSystem/List/List'
import type { UserFollowing_followers$data } from '../UserProfile/__generated__/UserFollowing_followers.graphql'
import UserItem from './UserItem'

type PeopleListProps = {
  users: UserFollowing_followers$data['followers']
  paginationCtrl: PaginationControl
}

export default function PeopleList(props: PeopleListProps) {
  const users = props.users.edges.map(item => item?.node).filter(item => item != null)
  return (
    <List paginationCtrl={props.paginationCtrl}>
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </List>
  )
}
