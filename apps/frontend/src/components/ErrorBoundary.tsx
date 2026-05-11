import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm font-mono">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
