import { useFragment } from 'react-relay'

import { fragment } from './UserSidebar.relay'
import Anchor from '../../../../designSystem/Anchor/Anchor'
import EmailIcon from '../../../../designSystem/Icon/Email'
import Image from '../../../../designSystem/Image/Image'
import LinkIcon from '../../../../designSystem/Icon/Link'
import LocationIcon from '../../../../designSystem/Icon/Location'
import OrganizationIcon from '../../../../designSystem/Icon/Organization'
import AvatarList from '../AvatarList/AvatarList'
import Title from '../../../../designSystem/Title/Title'
import type { ProfileOwner } from '../ProfileOwnerList/ProfileOwnerList'
import type { UserSidebar$key } from './__generated__/UserSidebar.graphql'
import './UserSidebar.css'

type UserSidebarProps = {
  profile: UserSidebar$key
}

export default function UserSidebar(props: UserSidebarProps) {
  const user = useFragment(fragment.profile, props.profile)
  const organizations = user.organizations.edges.map(item => item?.node)

  return (
    <div className="UserSidebar">
      <Image
        alt={user.login}
        className="avatar"
        decoration="circle"
        height={288}
        src={user.avatarUrl}
        width={288}
      />
      <Title className="vcard" variant="h1">
        {user.name && <p className="name">{user.name}</p>}
        <p className="login">{user.login}</p>
      </Title>
      {user.bio &&
        <p className="bio body2">{user.bio}</p>
      }
      {user.email &&
        <Anchor href={`mailto:${user.email}`} external>
          <EmailIcon />
          <span>{user.email}</span>
        </Anchor>
      }
      {user.websiteUrl &&
        <Anchor href={user.websiteUrl} external>
          <LinkIcon />
          {user.websiteUrl}
        </Anchor>
      }
      {user.company &&
        <p className="company">
          <OrganizationIcon />
          {user.company}
        </p>
      }
      {user.location &&
        <p className="location">
          <LocationIcon />
          {user.location}
        </p>
      }
      {organizations.length > 0 &&
        <AvatarList title="Organizations" items={organizations as ProfileOwner[]} />
      }
    </div>
  )
}
