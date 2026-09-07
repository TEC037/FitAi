import React from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('FitAI ErrorBoundary capturó un error:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#050505]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Algo salió mal</h2>
            <p className="text-sm text-white/50 max-w-md mt-1">
              Ocurrió un error inesperado al renderizar esta sección.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-[#C0FF00] text-black text-xs font-black rounded-xl hover:bg-[#aee600] transition-colors inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
