import React from 'react'

interface IProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}
interface IState {
  hasError: boolean
}

const ErrorView = () => (
  <div>
    <h1>Something went wrong.</h1>
    <p>Try refresh the page</p>
  </div>
)

class ErrorBoundary extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError === false) return this.props.children
    if (this.props.fallback) return this.props.fallback
    return <ErrorView />
  }
}

export default ErrorBoundary
