// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <h3 className="text-danger">Something went wrong: {this.state.error?.message}</h3>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
