import { cls } from '../../util/classNames'
import { useMenuItems, useCurrentTab } from './PageMenu.hooks'
import Anchor from '../Anchor/Anchor'
import Container from '../Container/Container'
import type { ProfileOwnerType } from '../../util/types'
import './PageMenu.css'

type AppMenuProps = {
  className?: string
  profileOwnerType?: ProfileOwnerType
}

export default function AppMenu(props: AppMenuProps) {
  const { className, profileOwnerType } = props

  const activeTab = useCurrentTab()
  const menuItems = useMenuItems(profileOwnerType)
  const classes = cls('AppMenu', className)

  return (
    <Container className={classes}>
      <ul>
        {Object.entries(menuItems).map(([key, value]) => (
          <li key={key} className={cls([activeTab === key, 'active'])}>
            <Anchor className="menuItem" decoration="button" href={value.href}>
              {value.icon}
              {value.label}
            </Anchor>
          </li>
        ))}
      </ul>
    </Container>
  )
}
