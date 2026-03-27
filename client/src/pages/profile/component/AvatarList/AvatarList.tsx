import Anchor from '../../../../designSystem/Anchor/Anchor'
import Image from '../../../../designSystem/Image/Image'
import Title from '../../../../designSystem/Title/Title'
import type { ProfileOwner } from '../ProfileOwnerList/ProfileOwnerList'
import './AvatarList.css'

type AvatarListProps = {
  items: ProfileOwner[]
  title: string
}

export default function AvatarList(props: AvatarListProps) {
  const { items, title } = props

  return (
    <aside className="AvatarList">
      <Title variant="h2">{title}</Title>
      <nav>
        {items.map(owner => {
          const localUrl = owner.url.replace(/https?:\/\/github\.com/, '')
          const decoration = owner.__typename === 'User'
            ? 'circle'
            : 'rounded'
          return (
            <Anchor className="anchor" href={localUrl} key={owner.login} data-testid="owner-link">
              <Image
                alt={owner.login}
                decoration={decoration}
                height={32}
                src={owner.avatarUrl}
                width={32}
              />
            </Anchor>
          )
        })}
      </nav>
    </aside>
  )
}
