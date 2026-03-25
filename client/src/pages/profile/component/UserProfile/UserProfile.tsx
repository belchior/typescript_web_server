import { useCurrentTab, type TUserTabs } from '../PageMenu/PageMenu.hooks'
import { UserFollowers, UserFollowing } from './UserFollowing'
import { UserRepositories, UserStarredRepositories } from './UserRepositories'
import Title from '../../../../designSystem/Title/Title'
import type { UserFollowing_followers$key } from './__generated__/UserFollowing_followers.graphql'
import type { UserFollowing_following$key } from './__generated__/UserFollowing_following.graphql'
import type { UserRepositories_repositories$key } from './__generated__/UserRepositories_repositories.graphql'
import type { UserRepositories_stars$key } from './__generated__/UserRepositories_stars.graphql'
import type { UserSidebar$key } from './__generated__/UserSidebar.graphql'
import UserSidebar from './UserSidebar'
import './UserProfile.css'

function Overview() {
  return <div className="Overview">
    <Title>
      Hi <span role="img" aria-label="hi">👋</span> friend!!!
    </Title>
  </div>
}

type UserProfileProps = {
  profile: UserSidebar$key
  & UserRepositories_repositories$key
  & UserRepositories_stars$key
  & UserFollowing_followers$key
  & UserFollowing_following$key
}

export default function UserProfile(props: UserProfileProps) {
  const { profile } = props
  const tabName = useCurrentTab<TUserTabs>()

  return <>
    <main className="UserProfile">
      <UserSidebar profile={profile} />
      {tabName === 'overview' && <Overview />}
      {tabName === 'repositories' && <UserRepositories profile={profile} />}
      {tabName === 'stars' && <UserStarredRepositories profile={profile} />}
      {tabName === 'followers' && <UserFollowers profile={profile} />}
      {tabName === 'following' && <UserFollowing profile={profile} />}
    </main>
  </>
}

