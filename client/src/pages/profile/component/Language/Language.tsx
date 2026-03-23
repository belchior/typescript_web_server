import React from 'react'
import './Language.css'

interface ILanguage {
  color: string
  children: React.ReactNode
}

const Language = (props: ILanguage) => {
  const { children, color } = props
  // const classes = useStyles()
  return (
    <span className="Language">
      <span className="circle" style={{ backgroundColor: color }} />
      <span>{children}</span>
    </span>
  )
}

export default Language
