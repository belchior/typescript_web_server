import { useLazyLoadQuery } from 'react-relay'
import { useParams } from 'react-router'

import { query } from './Profile.relay'
import { useCurrentTab } from '../../designSystem/PageMenu/PageMenu.hooks'
import Container from '../../designSystem/Container/Container'
import ErrorBoundary from '../../designSystem/ErrorBoundary/ErrorBoundary'
import NotFound from '../notfound/NotFound'
import OrganizationProfile from './component/OrganizationProfile/OrganizationProfile'
import PageMenu from '../../designSystem/PageMenu/PageMenu'
import type { ProfileQuery, ProfileQuery$data } from './__generated__/ProfileQuery.graphql'
import type { ProfileTypeName } from '../../util/types'
import UserProfile from './component/UserProfile/UserProfile'

type ProfilePageProps = {
  data: ProfileQuery$data
}
function ProfilePage(props: ProfilePageProps) {
  const { data } = props
  switch (data.profile?.__typename) {
    case 'User': return <UserProfile profile={data.profile} />
    case 'Organization': return <OrganizationProfile profile={data.profile} />
    default: return <NotFound />
  }
}

export default function Profile() {
  const params = useParams()
  const tabName = useCurrentTab()
  const data = useLazyLoadQuery<ProfileQuery>(
    query,
    {
      login: params.login!,
      repositories: tabName === 'repositories',
      stars: tabName === 'stars',
      followers: tabName === 'followers',
      following: tabName === 'following',
      people: tabName === 'people',
    }
  )

  return <>
    <PageMenu profileTypeName={data?.profile?.__typename as ProfileTypeName} />
    <Container className="AppContent" maxWidth="lg">
      <ErrorBoundary>
        <ProfilePage data={data} />
      </ErrorBoundary>
    </Container>
  </>
}

