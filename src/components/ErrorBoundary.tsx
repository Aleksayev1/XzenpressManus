import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-red-500 rounded-xl p-8 max-w-lg w-full shadow-2xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Algo deu errado</h1>
                        <p className="text-gray-300 mb-6">
                            Desculpe, ocorreu um erro inesperado. Nossa equipe técnica foi notificada.
                        </p>
                        {this.state.error && (
                            <div className="bg-black/50 p-4 rounded-lg overflow-auto mb-6">
                                <p className="text-red-400 font-mono text-xs">{this.state.error.toString()}</p>
                                {this.state.errorInfo && (
                                    <pre className="text-gray-500 font-mono text-[10px] mt-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
