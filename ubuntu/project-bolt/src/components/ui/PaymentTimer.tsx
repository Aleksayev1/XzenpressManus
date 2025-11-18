import React from 'react';
import { Clock } from 'lucide-react';

interface PaymentTimerProps {
  timeLeft: number;
}

export const PaymentTimer: React.FC<PaymentTimerProps> = ({ timeLeft }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) return null;

  return (
    <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <Clock className="w-5 h-5 text-yellow-600" />
      <span className="text-yellow-800 font-medium">
        Expira em: {formatTime(timeLeft)}
      </span>
    </div>
  );
};