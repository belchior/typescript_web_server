import { useFragment } from 'react-relay'

import PeopleList from '../PeopleList/PeopleList'
import Title from '../../../../designSystem/Title/Title'
import { fragment } from './OrganizationPeople.relay'
import type { OrganizationPeople$key } from './__generated__/OrganizationPeople.graphql'

type OrganizationPeopleProps = {
  profile: OrganizationPeople$key
}
export function OrganizationPeople(props: OrganizationPeopleProps) {
  const user = useFragment(fragment.people, props.profile)

  return <div>
    <Title variant="h2">People</Title>
    <PeopleList
      users={user.people}
      paginationCtrl={{
        hasMore: false,
        isLoading: false,
        loadMore: () => { },
      }}
    />
  </div>
}

