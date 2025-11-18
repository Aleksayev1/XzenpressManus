import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface PixCodeCopyProps {
  pixKey: string;
}

export const PixCodeCopy: React.FC<PixCodeCopyProps> = ({ pixKey }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="font-mono text-xs break-all text-gray-700 mb-3">
        {pixKey}
      </div>
      <button
        onClick={copyCode}
        className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all ${
          copied 
            ? 'bg-green-600 text-white' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        }`}
      >
        {copied ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copiar Código</span>
          </>
        )}
      </button>
    </div>
  );
};