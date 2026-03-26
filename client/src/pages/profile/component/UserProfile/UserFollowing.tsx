import { useFragment } from 'react-relay'

import { fragment } from './UserFollowing.relay'
import PeopleList from '../PeopleList/PeopleList'
import Title from '../../../../designSystem/Title/Title'
import type { UserFollowing_followers$key } from './__generated__/UserFollowing_followers.graphql'
import type { UserFollowing_following$key } from './__generated__/UserFollowing_following.graphql'
import ProfileOwnerList, { type ProfileOwner } from '../ProfileOwnerList/ProfileOwnerList'

type UserFollowingProps = {
  profile: UserFollowing_following$key
}
export function UserFollowing(props: UserFollowingProps) {
  const user = useFragment(fragment.following, props.profile)
  const items = user.following.edges
    .map(edge => edge?.node)
    .filter(node => node != null) as ProfileOwner[]

  return <div>
    <Title variant="h2">Following</Title>
    <ProfileOwnerList items={items} />
  </div>
}

type UserFollowersProps = {
  profile: UserFollowing_followers$key
}
export function UserFollowers(props: UserFollowersProps) {
  const user = useFragment(fragment.followers, props.profile)

  return <div>
    <Title variant="h2">Followers</Title>
    <PeopleList items={user.followers} />
  </div>
}
