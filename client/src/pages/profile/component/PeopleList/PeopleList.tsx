import List, { type PaginationControl } from '../../../../designSystem/List/List'
import type { UserFollowing_following$data } from '../UserProfile/__generated__/UserFollowing_following.graphql'
import UserItem from '../UserItem/UserItem'

type PeopleListProps = {
  users: UserFollowing_following$data['following']
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
