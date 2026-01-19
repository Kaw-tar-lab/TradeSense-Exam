import React from 'react';

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught error", error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false });
    if ((this as any).props.onReset) (this as any).props.onReset();
  };

  render() {
    if (((this as any).state).hasError) {
      return ((this as any).props).fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Oups ! Une erreur est survenue</h2>
            <p className="text-slate-400 mb-6">L’application a rencontré un problème inattendu.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}