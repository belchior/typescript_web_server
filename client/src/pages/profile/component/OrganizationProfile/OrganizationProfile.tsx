import { OrganizationFollowers } from './OrganizationFollowers'
import { OrganizationPeople } from './OrganizationPeople'
import { OrganizationRepositories } from './OrganizationRepositories'
import { useCurrentTab, type TOrganizationTabs } from '../PageMenu/PageMenu.hooks'
import OrganizationHeader from './OrganizationHeader'
import Title from '../../../../designSystem/Title/Title'
import type { OrganizationFollowers$key } from './__generated__/OrganizationFollowers.graphql'
import type { OrganizationHeader$key } from './__generated__/OrganizationHeader.graphql'
import type { OrganizationPeople$key } from './__generated__/OrganizationPeople.graphql'
import type { OrganizationRepositories$key } from './__generated__/OrganizationRepositories.graphql'
import './OrganizationProfile.css'

function Overview() {
  const style = {
    border: '1px solid var(--divider)',
    borderRadius: 'var(--border-radius)',
    padding: '1.5rem',
  }
  return <div className="Overview" style={style}>
    <Title>
      Hi <span role="img" aria-label="hi">👋</span> friend!
    </Title>
  </div>
}

type OrganizationProfileProps = {
  profile: OrganizationHeader$key
  & OrganizationRepositories$key
  & OrganizationPeople$key
  & OrganizationFollowers$key
}

export default function OrganizationProfile(props: OrganizationProfileProps) {
  const { profile } = props
  const tabName = useCurrentTab<TOrganizationTabs>()

  return (
    <main className="OrganizationProfile">
      <OrganizationHeader profile={profile} />
      {tabName === 'overview' && <Overview />}
      {tabName === 'repositories' && <OrganizationRepositories profile={profile} />}
      {tabName === 'people' && <OrganizationPeople profile={profile} />}
      {tabName === 'followers' && <OrganizationFollowers profile={profile} />}
    </main>
  )
}

