import { useState, useEffect, useRef } from 'react';
import { createPixService, PixPaymentData, PixResponse } from '../services/pixService';

export const usePixPayment = () => {
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const expectedTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pixService = createPixService();

  const generatePayment = async (data: PixPaymentData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await pixService.createPayment(data);
      setPixData(response);
      const expiresIn = Math.floor((response.expiresAt.getTime() - Date.now()) / 1000);
      setTimeLeft(Math.max(0, expiresIn));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar PIX';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!pixData || checkingStatus) return;
    
    setCheckingStatus(true);
    try {
      const status = await pixService.checkStatus(pixData.paymentId);
      if (status.status !== 'pending') {
        setPixData(prev => prev ? { ...prev, status: status.status } : null);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const startTime = Date.now();
      expectedTimeRef.current = startTime + 1000;
      
      const tick = () => {
        const now = Date.now();
        const drift = now - expectedTimeRef.current;
        
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
        
        if (timeLeft > 1) {
          expectedTimeRef.current += 1000;
          const nextDelay = Math.max(0, 1000 - drift);
          timerRef.current = setTimeout(tick, nextDelay);
        }
      };
      
      timerRef.current = setTimeout(tick, 1000);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [pixData]);

  useEffect(() => {
    if (timeLeft > 0) {
      const startTime = Date.now();
      expectedTimeRef.current = startTime + 1000;
      
      const tick = () => {
        const now = Date.now();
        const drift = now - expectedTimeRef.current;
        
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
        
        if (timeLeft > 1) {
          expectedTimeRef.current += 1000;
          const nextDelay = Math.max(0, 1000 - drift);
          timerRef.current = setTimeout(tick, nextDelay);
        }
      };
      
      timerRef.current = setTimeout(tick, 1000);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [timeLeft]);

  return {
    pixData,
    loading,
    error,
    timeLeft,
    checkingStatus,
    generatePayment,
    checkStatus,
    providerName: pixService.getProviderName()
  };
};