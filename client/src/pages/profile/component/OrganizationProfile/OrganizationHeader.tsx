import { useFragment } from 'react-relay'

import Anchor from '../../../../designSystem/Anchor/Anchor'
import Image from '../../../../designSystem/Image/Image'
import LinkIcon from '../../../../designSystem/Icon/Link'
import LocationIcon from '../../../../designSystem/Icon/Location'
import Title from '../../../../designSystem/Title/Title'
import { fragment } from './OrganizationHeader.relay'
import type { OrganizationHeader$key } from './__generated__/OrganizationHeader.graphql'
import './OrganizationHeader.css'

type OrganizationHeaderProps = {
  profile: OrganizationHeader$key
}

export default function OrganizationHeader(props: OrganizationHeaderProps) {
  const profile = useFragment(fragment.profile, props.profile)

  return (
    <header className="OrganizationHeader">
      <Image
        className="logo"
        decoration="rounded"
        src={profile.avatarUrl}
        alt={profile.login}
        height={100}
        width={100}
      />
      <div>
        {profile.name && <Title component="h1" variant="h2">{profile.name}</Title>}
        {profile.description &&
          <p className="description">{profile.description}</p>
        }
        {profile.location &&
          <span className="label">
            <LocationIcon />
            {profile.location}
          </span>
        }
        {profile.websiteUrl &&
          <Anchor
            className="label"
            decoration="secondary"
            external
            href={profile.websiteUrl}
          >
            <LinkIcon />
            {profile.websiteUrl}
          </Anchor>
        }
      </div>
    </header>
  )
}

