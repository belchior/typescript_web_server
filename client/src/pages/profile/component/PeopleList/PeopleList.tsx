import List from '../../../../designSystem/List/List'
import type { UserFollowing_followers$data } from '../UserProfile/__generated__/UserFollowing_followers.graphql'
import UserItem from './UserItem'

type PeopleListProps = {
  items: UserFollowing_followers$data['followers']
}

export default function PeopleList(props: PeopleListProps) {
  const users = props.items.edges.map(item => item?.node).filter(item => item != null)
  return (
    <List>
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </List>
  )
}
