import { type PropsWithChildren } from 'react'

import './List.css'

type ListProps = PropsWithChildren

export default function List(props: ListProps) {
  const { children } = props

  if (Array.isArray(children) && children.length === 0) {
    return (
      <div className="List">
        <p className="empty">There is no item to show</p>
      </div>
    )
  }

  return (
    <div className="List">
      <ul>
        {children}
      </ul>
    </div>
  )
}

