import { useFragment } from 'react-relay'

import { fragment } from './OrganizationFollowers.relay'
import PeopleList from '../PeopleList/PeopleList'
import Title from '../../../../designSystem/Title/Title'
import type { OrganizationFollowers$key } from './__generated__/OrganizationFollowers.graphql'

type OrganizationFollowersProps = {
  profile: OrganizationFollowers$key
}
export function OrganizationFollowers(props: OrganizationFollowersProps) {
  const organiztion = useFragment(fragment.followers, props.profile)

  return <div>
    <Title variant="h2">Followers</Title>
    <PeopleList items={organiztion.followers} />
  </div>
}
