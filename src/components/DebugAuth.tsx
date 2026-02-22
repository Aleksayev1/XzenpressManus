import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugAuth: React.FC = () => {
    const [status, setStatus] = useState<string>('Verificando...');
    const [envInfo, setEnvInfo] = useState<any>({});

    useEffect(() => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setEnvInfo({
            urlLength: url ? url.length : 0,
            urlStart: url ? url.substring(0, 15) + '...' : 'N/A',
            keyLength: key ? key.length : 0,
            keyStart: key ? key.substring(0, 5) + '...' : 'N/A',
            keyEnd: key ? '...' + key.substring(key.length - 5) : 'N/A'
        });

        const checkSession = async () => {
            if (!supabase) return;
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                // Tentar buscar se é premium no localStorage (rápido) ou banco
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');

                setEnvInfo((prev: any) => ({
                    ...prev,
                    userId: data.session?.user.id,
                    userEmail: data.session?.user.email,
                    isPremium: localUser.isPremium || false
                }));
            }
        };

        checkSession();
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            if (!supabase) {
                setStatus('❌ Supabase Client é NULL');
                return;
            }
            const { error } = await supabase.auth.getSession();
            if (error) {
                setStatus(`❌ Erro de Conexão: ${error.message}`);
            } else {
                setStatus('✅ Conexão OK via getSession()');
            }
        } catch (e: any) {
            setStatus(`💥 Exceção: ${e.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-black">
            <h1 className="text-2xl font-bold mb-4">Diagnóstico de Autenticação</h1>

            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="font-bold mb-2">Informações do Usuário</h2>
                <div className="space-y-2 font-mono text-sm">
                    <p><strong>Status:</strong> {status}</p>
                    <p><strong>User ID (UID):</strong> {envInfo.userId || 'Não autenticado'}</p>
                    <p><strong>Email:</strong> {envInfo.userEmail || 'N/A'}</p>
                    <p>
                        <strong>Premium:</strong>
                        <span className={envInfo.isPremium ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {envInfo.isPremium ? ' ✅ ATIVO' : ' ❌ INATIVO'}
                        </span>
                    </p>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    Se você pagou e o Premium está "INATIVO", envie o seu **User ID (UID)** acima para suporte.
                </p>
            </div>

            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="font-bold mb-2">Variáveis de Ambiente (Vite)</h2>
                <ul className="space-y-2 font-mono text-sm">
                    <li>
                        <strong>VITE_SUPABASE_URL:</strong> {envInfo.urlStart} (Len: {envInfo.urlLength})
                    </li>
                    <li>
                        <strong>VITE_SUPABASE_ANON_KEY:</strong> {envInfo.keyStart}{envInfo.keyEnd} (Len: {envInfo.keyLength})
                    </li>
                </ul>
                <p className="mt-4 text-xs text-gray-500">
                    Compare estes valores com o seu Supabase Dashboard.<br />
                    Se estiverem diferentes ou "N/A", verifique o Netlify Environment Variables e faça um Deploy limpando o cache.
                </p>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="font-bold mb-2">Teste de Conexão</h2>
                <div className={`p-4 rounded ${status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status}
                </div>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Recarregar Página
            </button>
        </div>
    );
};
