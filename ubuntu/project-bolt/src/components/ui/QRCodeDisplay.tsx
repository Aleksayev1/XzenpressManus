import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeBase64?: string;
  pixKey: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeBase64, pixKey }) => {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg p-4 mb-4">
        {qrCodeBase64 ? (
          <img 
            src={qrCodeBase64} 
            alt="QR Code PIX" 
            className="w-48 h-48 mx-auto border border-gray-200 rounded bg-white"
          />
        ) : (
          <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-500 text-sm">QR Code PIX</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-green-700">Escaneie com seu app do banco</p>
      <p className="text-xs text-green-600 mt-2">Chave: aleksayevacupress@gmail.com</p>
    </div>
  );
};