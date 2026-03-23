import React from 'react'

import Anchor from '../../../../designSystem/Anchor/Anchor'
import Image from '../../../../designSystem/Image/Image'
import Title from '../../../../designSystem/Title/Title'
import type { ProfileTypeName } from '../../../../util/types'
import './ProfileOwnerList.css'

export type ProfileOwner = {
  avatarUrl: string
  id: string
  login: string
  name?: string
  url: string
  __typename?: ProfileTypeName
}
interface ProfileOwnerListProps {
  owners: ProfileOwner[]
  title: React.ReactNode
}

export default function ProfileOwnerList(props: ProfileOwnerListProps) {
  const { owners, title } = props

  return (
    <div className="ProfileOwnerList">
      <Title variant="h2">{title}</Title>
      {owners.map(owner => {
        const localUrl = owner.url.replace(/https?:\/\/github\.com/, '')
        const decoration = owner.__typename === 'User'
          ? 'circle'
          : 'rounded'
        return (
          <Anchor className="anchor" href={localUrl} key={owner.login} data-testid="owner-link">
            <Image alt={owner.login} src={owner.avatarUrl} height={32} width={32} decoration={decoration} />
          </Anchor>
        )
      })}
    </div>
  )
}
