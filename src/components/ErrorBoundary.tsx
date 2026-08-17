import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-[#1A265A]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#50A5B1]/30 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-[#F1600D]/10 text-[#F1600D] rounded-2xl flex items-center justify-center mx-auto border border-[#F1600D]/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-black text-[#1A265A]">
              Ein unerwarteter Fehler ist aufgetreten
            </h2>
            
            <p className="text-xs text-[#1A265A]/80 leading-relaxed">
              Die Ansicht konnte leider nicht geladen werden. Klicke auf den Button unten, um die Seite neu zu laden und fortzufahren.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 p-3 rounded-xl border border-[#50A5B1]/20 text-[11px] font-mono text-left text-red-600 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Seite neu laden</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
