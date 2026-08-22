import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NutriVision error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center text-[var(--text-secondary)] px-6 text-center">
          <div className="w-12 h-12 bg-red-900/20 text-red-400 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-2xl mb-3 font-serif text-[var(--text-primary)]">Something went wrong</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-accent text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-accent-dim transition-colors"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
