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

        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            if (!supabase) {
                setStatus('❌ Supabase Client é NULL');
                return;
            }
            const { data, error } = await supabase.auth.getSession();
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
