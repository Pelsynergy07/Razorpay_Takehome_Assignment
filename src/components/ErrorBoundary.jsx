import React from 'react';

// Last-resort safety net: an uncaught render error anywhere in the tree
// otherwise unmounts the whole app to a blank page with no way back short
// of a manual reload. This catches it and offers that reload explicitly.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          height: '100vh',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'inherit',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>Something went wrong.</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Please reload the page to continue.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
