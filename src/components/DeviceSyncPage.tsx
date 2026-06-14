import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Activity, Heart, Moon, RefreshCw, Sliders, Smartphone, Battery, Info, ShieldAlert, Cpu } from 'lucide-react';
import { loadAnamneseProfile } from '../data/anamneseProfile';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DeviceSyncPageProps {
  onPageChange: (page: string) => void;
}

interface Device {
  id: string;
  name: string;
  brand: string;
  icon: string;
  status: 'disconnected' | 'connecting' | 'connected';
  battery: number;
  syncTime: string;
  defaultMetrics: {
    vfc: number;
    rhr: number;
    deepSleep: string;
  };
}

export const DeviceSyncPage: React.FC<DeviceSyncPageProps> = ({ onPageChange }) => {
  const [activeDeviceId, setActiveDeviceId] = useState<string>(() => {
    return localStorage.getItem('active_device_id') || 'oura';
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    const savedActiveId = localStorage.getItem('active_device_id') || 'oura';
    return [
      {
        id: 'oura',
        name: 'Oura Ring Gen 3',
        brand: 'Oura',
        icon: '💍',
        status: savedActiveId === 'oura' ? 'connected' : 'disconnected',
        battery: savedActiveId === 'oura' ? 88 : 0,
        syncTime: savedActiveId === 'oura' ? 'Há 5 minutos' : '-',
        defaultMetrics: { vfc: 58, rhr: 54, deepSleep: '1h 45m' }
      },
      {
        id: 'apple',
        name: 'Apple Watch Series 9',
        brand: 'Apple',
        icon: '⌚',
        status: savedActiveId === 'apple' ? 'connected' : 'disconnected',
        battery: savedActiveId === 'apple' ? 95 : 0,
        syncTime: savedActiveId === 'apple' ? 'Sincronizado agora' : '-',
        defaultMetrics: { vfc: 52, rhr: 62, deepSleep: '1h 20m' }
      },
      {
        id: 'garmin',
        name: 'Garmin Fenix 7',
        brand: 'Garmin',
        icon: '⛰️',
        status: savedActiveId === 'garmin' ? 'connected' : 'disconnected',
        battery: savedActiveId === 'garmin' ? 92 : 0,
        syncTime: savedActiveId === 'garmin' ? 'Sincronizado agora' : '-',
        defaultMetrics: { vfc: 66, rhr: 50, deepSleep: '2h 15m' }
      },
      {
        id: 'samsung',
        name: 'Galaxy Watch 6',
        brand: 'Samsung',
        icon: '⚡',
        status: savedActiveId === 'samsung' ? 'connected' : 'disconnected',
        battery: savedActiveId === 'samsung' ? 90 : 0,
        syncTime: savedActiveId === 'samsung' ? 'Sincronizado agora' : '-',
        defaultMetrics: { vfc: 48, rhr: 66, deepSleep: '1h 10m' }
      }
    ];
  });

  const [vfcValue, setVfcValue] = useState<number>(() => {
    return Number(localStorage.getItem('wearable_vfc')) || 58;
  });
  const [rhrValue, setRhrValue] = useState<number>(() => {
    return Number(localStorage.getItem('wearable_rhr')) || 54;
  });
  const [deepSleep, setDeepSleep] = useState<string>(() => {
    return localStorage.getItem('wearable_sleep') || '1h 45m';
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationDismissed, setNotificationDismissed] = useState<boolean>(false);

  const { user } = useAuth();
  const [apiSyncStatus, setApiSyncStatus] = useState<'active' | 'disconnected' | 'error' | 'none'>('none');
  const [apiProvider, setApiProvider] = useState<string>('');
  const [apiDeviceName, setApiDeviceName] = useState<string>('');
  const [showVitalWidget, setShowVitalWidget] = useState(false);
  const [selectedWidgetDevice, setSelectedWidgetDevice] = useState<string>('');
  const [isConnectingWidget, setIsConnectingWidget] = useState(false);

  // For visual graph animation
  const [graphData, setGraphData] = useState<number[]>(Array.from({ length: 20 }, () => 50 + Math.random() * 20));
  const graphInterval = useRef<NodeJS.Timeout | null>(null);

  // Active device helper
  const activeDevice = devices.find(d => d.id === activeDeviceId && d.status === 'connected');

  // Dynamic recommendation based on Anamnese Profile elements
  const getRecommendedPoint = () => {
    const profile = loadAnamneseProfile();
    
    // Default fallback: user's highly successful cranial nerve X (Vago) linked to Liver point!
    let pointId = 'ynsa-liver';
    let pointName = 'YNSA Fígado (N. Vago — NC X)';
    let reason = 'Seu tônus vagal e VFC estão extremamente baixos. A estimulação do 10º par craniano (Nervo Vago) na região occipital/dorsal regula o sistema parassimpático, seda a irritação celular e drena a sobrecarga energética (Fogo do Fígado).';
    let labelSuffix = 'NC X / Fígado';

    if (profile?.guardianScores) {
      // Find the weakest guardian element (lowest score)
      const scores = profile.guardianScores;
      const weakest = Object.entries(scores).reduce(
        (min, [key, val]) => (val < min[1] ? [key, val] : min),
        ['madeira', 100]
      );
      
      const element = weakest[0];
      
      if (element === 'madeira') {
        pointId = 'ynsa-liver';
        pointName = 'YNSA Fígado (N. Vago — NC X)';
        reason = 'Seu perfil indica fragilidade no elemento Madeira (Fígado) e sintomas associados a estresse ou tensão. O ponto do Nervo Vago (NC X) correspondente ao Fígado drena o calor hepático acumulado e aciona a resposta parassimpática e anti-inflamatória sistêmica.';
        labelSuffix = 'NC X / Fígado';
      } else if (element === 'terra') {
        pointId = 'septicemia-zusanli-st36';
        pointName = 'Zusanli (ST36) - Fortaleza Imune';
        reason = 'Seu perfil indica fragilidade no elemento Terra (Baço/Estômago) com cansaço e digestão lenta. Zusanli nutre a base energética e restaura a vitalidade física, aumentando o tônus parassimpático.';
        labelSuffix = 'E36 / ZS';
      } else if (element === 'fogo') {
        pointId = 'zs-point';
        pointName = 'YNSA Ponto ZS (Zeise-Suess)';
        reason = 'Seu perfil indica sensibilidade no elemento Fogo (Coração/Ansiedade). O ponto mestre ZS de imunidade neuro-hormonal estabiliza o estresse traumático e combate a hiperexcitabilidade simpática.';
        labelSuffix = 'ZS / YNSA';
      } else if (element === 'metal') {
        pointId = 'ynsa-zf-pulmao';
        pointName = 'YNSA Pulmão (Imunidade)';
        reason = 'Seu perfil aponta fragilidade no elemento Metal (Pulmão/Pele). O ponto do Pulmão restabelece o fluxo do Qi respiratório e a imunidade profunda de barreira.';
        labelSuffix = 'Pulmão';
      } else if (element === 'agua') {
        pointId = 'r1-yongquan';
        pointName = 'R1 (Yongquan) - Fonte Borbulhante';
        reason = 'Seu perfil indica fragilidade no elemento Água (Rim/Medo/Lombar). Yongquan drena o excesso de fogo mental e cerebral para a sola do pé, induzindo o relaxamento e o sono reparador.';
        labelSuffix = 'R1 / Rim';
      }
    }
    
    return { pointId, pointName, reason, labelSuffix };
  };

  const recommended = getRecommendedPoint();

  // Save active device ID to localStorage
  useEffect(() => {
    localStorage.setItem('active_device_id', activeDeviceId);
  }, [activeDeviceId]);

  // Synchronize telemetry values to localStorage for use in the tracking page
  useEffect(() => {
    localStorage.setItem('wearable_vfc', vfcValue.toString());
    localStorage.setItem('wearable_rhr', rhrValue.toString());
    localStorage.setItem('wearable_sleep', deepSleep);
  }, [vfcValue, rhrValue, deepSleep]);

  // Live heart pulse representation
  useEffect(() => {
    graphInterval.current = setInterval(() => {
      setGraphData(prev => {
        const next = [...prev.slice(1)];
        // Add variation centered around current VFC value
        const target = isSimulating ? vfcValue : (activeDevice?.defaultMetrics.vfc || 55);
        const randVariation = (Math.random() - 0.5) * 8;
        const newPoint = Math.max(10, Math.min(100, target + randVariation));
        next.push(newPoint);
        return next;
      });
    }, 1000);

    return () => {
      if (graphInterval.current) clearInterval(graphInterval.current);
    };
  }, [vfcValue, isSimulating, activeDeviceId, devices]);

  // Trigger predictive alert when VFC drops below threshold (e.g. 35 ms)
  useEffect(() => {
    if (vfcValue < 35) {
      if (!notificationDismissed) {
        setShowNotification(true);
      }
    } else {
      setShowNotification(false);
      setNotificationDismissed(false); // Reset dismissal if VFC recovers
    }
  }, [vfcValue, notificationDismissed]);

  // Fetch connection status from Supabase xzen_user_telemetry_status
  useEffect(() => {
    const fetchApiSyncStatus = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('xzen_user_telemetry_status')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data && !error) {
          setApiSyncStatus(data.sync_status);
          setApiProvider(data.provider || '');
          setApiDeviceName(data.active_device_id || '');
        }
      } catch (err) {
        console.error('Erro ao buscar status do wearable na nuvem:', err);
      }
    };
    fetchApiSyncStatus();
  }, [user?.id]);

  const handleConnectWidgetDevice = async (deviceType: string) => {
    setIsConnectingWidget(true);
    
    // Simulate OAuth redirect or QR Code scan time
    setTimeout(async () => {
      try {
        const defaultMetrics: Record<string, { vfc: number, rhr: number, sleep: string, name: string }> = {
          apple: { vfc: 54, rhr: 60, sleep: '1h 35m', name: 'Apple Watch Series 9' },
          oura: { vfc: 62, rhr: 52, sleep: '2h 05m', name: 'Oura Ring Gen 3' },
          garmin: { vfc: 68, rhr: 48, sleep: '2h 30m', name: 'Garmin Fenix 7' },
          google: { vfc: 50, rhr: 65, sleep: '1h 15m', name: 'Fitbit Charge 6' }
        };

        const metrics = defaultMetrics[deviceType] || defaultMetrics.oura;

        if (user?.id) {
          // Save to Supabase telemetry status
          await supabase
            .from('xzen_user_telemetry_status')
            .upsert({
              user_id: user.id,
              sync_status: 'active',
              last_sync_at: new Date().toISOString(),
              active_device_id: metrics.name,
              provider: 'vital'
            });

          // Save telemetry data
          await supabase
            .from('xzen_user_telemetry')
            .insert({
              user_id: user.id,
              wearable_vfc: metrics.vfc,
              wearable_rhr: metrics.rhr,
              wearable_sleep: metrics.sleep,
              active_device_id: metrics.name,
              provider: 'vital'
            });
          
          // Sync values locally
          setVfcValue(metrics.vfc);
          setRhrValue(metrics.rhr);
          setDeepSleep(metrics.sleep);
          setIsSimulating(false);

          setApiSyncStatus('active');
          setApiProvider('vital');
          setApiDeviceName(metrics.name);
        }

        setIsConnectingWidget(false);
        setShowVitalWidget(false);
      } catch (err) {
        console.error(err);
        setIsConnectingWidget(false);
      }
    }, 2500);
  };

  const handleConnect = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'connecting' } : d));

    setTimeout(() => {
      setDevices(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            status: 'connected',
            battery: 95,
            syncTime: 'Sincronizado agora',
          };
        }
        // Deselect others if they were connected (keep single active active telemetry source for clarity)
        if (d.status === 'connected' && id !== d.id) {
          return { ...d, status: 'disconnected', battery: 0, syncTime: '-' };
        }
        return d;
      }));
      setActiveDeviceId(id);
      
      // Update values to new device defaults directly on connection using static map to avoid stale closures
      const defaultMetricsMap: Record<string, { vfc: number, rhr: number, deepSleep: string }> = {
        oura: { vfc: 58, rhr: 54, deepSleep: '1h 45m' },
        apple: { vfc: 52, rhr: 62, deepSleep: '1h 20m' },
        garmin: { vfc: 66, rhr: 50, deepSleep: '2h 15m' },
        samsung: { vfc: 48, rhr: 66, deepSleep: '1h 10m' }
      };
      const metrics = defaultMetricsMap[id];
      if (metrics) {
        setVfcValue(metrics.vfc);
        setRhrValue(metrics.rhr);
        setDeepSleep(metrics.deepSleep);
        setIsSimulating(false);
      }
    }, 1800);
  };

  const handleDisconnect = (id: string) => {
    setDevices(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status: 'disconnected' as const, battery: 0, syncTime: '-' } : d);
      const remaining = updated.filter(d => d.status === 'connected');
      if (remaining.length > 0) {
        setActiveDeviceId(remaining[0].id);
        setVfcValue(remaining[0].defaultMetrics.vfc);
        setRhrValue(remaining[0].defaultMetrics.rhr);
        setDeepSleep(remaining[0].defaultMetrics.deepSleep);
        setIsSimulating(false);
      } else {
        setActiveDeviceId('');
        setVfcValue(55);
        setRhrValue(60);
        setDeepSleep('1h 30m');
        setIsSimulating(false);
      }
      return updated;
    });
  };

  const startCriticalSimulation = () => {
    setIsSimulating(true);
    setNotificationDismissed(false);
    // Slowly slide values down to feel premium and realistic
    let currentVfc = vfcValue;
    let currentRhr = rhrValue;
    const interval = setInterval(() => {
      let stepDone = true;
      if (currentVfc > 28) {
        currentVfc -= 2;
        setVfcValue(Math.max(28, currentVfc));
        stepDone = false;
      }
      if (currentRhr < 82) {
        currentRhr += 1.5;
        setRhrValue(Math.min(82, currentRhr));
        stepDone = false;
      }
      if (stepDone) {
        clearInterval(interval);
      }
    }, 100);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setShowNotification(false);
    setNotificationDismissed(false);
    if (activeDevice) {
      setVfcValue(activeDevice.defaultMetrics.vfc);
      setRhrValue(activeDevice.defaultMetrics.rhr);
      setDeepSleep(activeDevice.defaultMetrics.deepSleep);
    } else {
      setVfcValue(55);
      setRhrValue(60);
      setDeepSleep('1h 30m');
    }
  };

  const navigateToAcupoint = (pointId: string) => {
    localStorage.setItem('preselected_acupressure_point', pointId);
    onPageChange('acupressure');
  };

  // Determine nervous system state description
  const getNervousSystemState = () => {
    if (vfcValue >= 50) {
      return {
        label: 'Parassimpático Predominante',
        desc: 'Seu corpo está em modo de regeneração profunda, reparo celular e calma metabólica. Alta adaptabilidade ao estresse.',
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      };
    } else if (vfcValue >= 35) {
      return {
        label: 'Equilíbrio Simpático-Parassimpático',
        desc: 'Nível moderado de alerta fisiológico. Estado ideal para produtividade e foco mental, com recuperação controlada.',
        color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      };
    } else {
      return {
        label: 'Sobrecarga Simpático-Tônica (Luta ou Fuga)',
        desc: 'VFC Crítica. Sistema nervoso autônomo está hiper-reativo. Sobrecarga cardiovascular, inflamação celular potencial e cortisol alto.',
        color: 'text-red-400 bg-red-950/40 border-red-500/30 animate-pulse',
        badge: 'bg-red-500/20 text-red-400 border border-red-500/30'
      };
    }
  };

  const systemState = getNervousSystemState();

  // Convert SVG coordinates for our VFC wave
  const svgWidth = 500;
  const svgHeight = 120;
  const pointsString = graphData
    .map((val, index) => {
      const x = (index / (graphData.length - 1)) * svgWidth;
      // Invert Y coordinate so higher VFC is higher on screen
      const y = svgHeight - 15 - ((val - 10) / 90) * (svgHeight - 30);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 pt-20 px-4 relative overflow-hidden">
      {/* Premium background ambient light effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back navigation */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onPageChange('home')}
            className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-800/80 transition-all group shadow-lg mr-4 flex items-center justify-center"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </button>
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">Telemetria & Pulsologia Digital</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 tracking-tight">
              Sincronização de Wearables
            </h1>
          </div>
        </div>

        {/* Info Box about Pulsologia Digital */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="p-4 bg-cyan-950/60 border border-cyan-800/40 rounded-2xl text-cyan-400 flex items-center justify-center shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">A Pulsologia Digital na Longevidade</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Na Medicina Tradicional Chinesa, o diagnóstico de pulso revela desequilíbrios nos órgãos antes de os sintomas se manifestarem. O equivalente digital moderno a essa leitura milenar é a análise contínua da <strong>VFC (Variabilidade da Frequência Cardíaca)</strong> e do <strong>Sono Profundo</strong>. Monitorar esses padrões permite ao Longevity OS prever picos de estresse celular e propor estimulações de acupressão preventivas em tempo real.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Realtime Stats & Simulator */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Telemetry Display */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/60 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs text-slate-400 font-mono">Telemetria Ativa</span>
              </div>

              <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Painel Biométrico em Tempo Real
              </h2>

              {!activeDevice && (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="font-semibold text-slate-400 mb-2">Nenhum dispositivo transmitindo</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto px-4">
                    Ative a sincronização de um dos seus wearables (Oura Ring, Apple Watch, Garmin ou Galaxy Watch) para monitorar seus sinais vitais em tempo real.
                  </p>
                </div>
              )}

              {activeDevice && (
                <div className="space-y-8">
                  {/* Three Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* VFC Card */}
                    <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">VFC / HRV</span>
                        <div className="p-2 bg-cyan-950/60 border border-cyan-800/40 rounded-lg text-cyan-400">
                          <Activity className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-extrabold font-mono tracking-tight transition-all duration-300 ${vfcValue < 35 ? 'text-red-400' : 'text-slate-100'}`}>
                          {vfcValue}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">ms</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Variabilidade do batimento cardíaco</p>
                    </div>

                    {/* Resting HR Card */}
                    <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Batimentos / Repouso</span>
                        <div className="p-2 bg-pink-950/60 border border-pink-800/40 rounded-lg text-pink-400">
                          <Heart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-100">
                          {Math.round(rhrValue)}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">bpm</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Média cardíaca em relaxamento</p>
                    </div>

                    {/* Deep Sleep Card */}
                    <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sono Profundo</span>
                        <div className="p-2 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-indigo-400">
                          <Moon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-100">
                          {deepSleep}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 font-medium">Ciclo restaurativo hormonal</p>
                    </div>
                  </div>

                  {/* SVG Live telemetry waveform graph */}
                  <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Curva de Batimento Fisiológica</h4>
                        <span className="text-[11px] text-slate-500">Representação gráfica do tónus vagal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400">Origem: {activeDevice.name}</span>
                      </div>
                    </div>
                    
                    <div className="relative h-28 flex items-center justify-center">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="vfcGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={vfcValue < 35 ? '#F87171' : '#22D3EE'} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={vfcValue < 35 ? '#EF4444' : '#6366F1'} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal guide lines */}
                        <line x1="0" y1="15" x2={svgWidth} y2="15" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1={svgHeight/2} x2={svgWidth} y2={svgHeight/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                        <line x1="0" y1={svgHeight-15} x2={svgWidth} y2={svgHeight-15} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                        {/* Fill path under the curve */}
                        <path
                          d={`M 0,${svgHeight} L 0,${graphData[0]} ${graphData.map((val, idx) => {
                            const x = (idx / (graphData.length - 1)) * svgWidth;
                            const y = svgHeight - 15 - ((val - 10) / 90) * (svgHeight - 30);
                            return `L ${x},${y}`;
                          }).join(' ')} L ${svgWidth},${svgHeight} Z`}
                          fill="url(#vfcGrad)"
                          className="transition-all duration-500 ease-in-out"
                        />

                        {/* Line path */}
                        <polyline
                          fill="none"
                          stroke={vfcValue < 35 ? '#EF4444' : '#22D3EE'}
                          strokeWidth="2.5"
                          points={pointsString}
                          className="transition-all duration-500 ease-in-out"
                        />

                        {/* Indicator pulses at data points */}
                        {graphData.map((val, idx) => {
                          if (idx === graphData.length - 1) {
                            const x = (idx / (graphData.length - 1)) * svgWidth;
                            const y = svgHeight - 15 - ((val - 10) / 90) * (svgHeight - 30);
                            return (
                              <g key={idx}>
                                <circle cx={x} cy={y} r="5" fill={vfcValue < 35 ? '#EF4444' : '#22D3EE'} />
                                <circle cx={x} cy={y} r="12" fill="none" stroke={vfcValue < 35 ? '#EF4444' : '#22D3EE'} strokeWidth="1" className="animate-ping" />
                              </g>
                            );
                          }
                          return null;
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Autonomic System Diagnosis */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${systemState.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <Info className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-200">Estado do Sistema Nervoso:</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${systemState.badge}`}>
                            {systemState.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mt-2">{systemState.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Physiological Stress Simulator */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800/85 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                Simulador de Estresse Fisiológico (VFC Drop)
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Use este controle para testar como o algoritmo preditivo do XZenPress atua. Ao simular uma queda drástica de VFC (gerada por estresse agudo, cansaço acumulado ou inflamação sistêmica imediata), o sistema ativa o Alerta de Biofeedback de modo proativo.
              </p>

              {activeDevice ? (
                <div className="space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-900">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Variabilidade da Frequência Cardíaca (VFC) simulada</span>
                      <span className={`font-mono text-sm ${vfcValue < 35 ? 'text-red-400 font-bold' : 'text-cyan-400'}`}>
                        {vfcValue} ms {vfcValue < 35 ? '(SOBRECARGA)' : '(SAUDÁVEL)'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <input
                         type="range"
                         min="15"
                         max="100"
                         value={vfcValue}
                         onChange={(e) => {
                           setIsSimulating(true);
                           setVfcValue(Number(e.target.value));
                         }}
                         className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                       />
                       
                       {/* Precise Control Buttons for Mobile */}
                       <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0">
                         <button
                           type="button"
                           onClick={() => {
                             setIsSimulating(true);
                             setVfcValue(prev => Math.max(15, prev - 1));
                           }}
                           className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 active:text-cyan-400 text-slate-300 font-bold transition-all text-base focus:outline-none"
                           title="Diminuir 1ms"
                         >
                           -
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setIsSimulating(true);
                             setVfcValue(prev => Math.min(100, prev + 1));
                           }}
                           className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 active:text-cyan-400 text-slate-300 font-bold transition-all text-base focus:outline-none"
                           title="Aumentar 1ms"
                         >
                           +
                         </button>
                       </div>
                     </div>
                    
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>15ms (Estresse Crítico)</span>
                      <span>50ms (Equilíbrio)</span>
                      <span>100ms (Excelente)</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      onClick={startCriticalSimulation}
                      className="flex-1 py-3 px-5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      💥 Forçar Queda de VFC Crítica (28ms)
                    </button>
                    <button
                      onClick={resetSimulation}
                      className="flex-1 py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      🔄 Restaurar Valores Normais (Vagus OK)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950/20 text-center rounded-2xl border border-dashed border-slate-900 text-slate-500 text-sm">
                  Conecte o Oura Ring ou outro dispositivo acima para liberar os controles do simulador.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Connected Devices List */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                Seus Dispositivos
              </h2>

              <div className="space-y-4">
                {devices.map((device) => {
                  const isSelected = activeDeviceId === device.id;
                  return (
                    <div
                      key={device.id}
                      onClick={() => device.status === 'connected' && setActiveDeviceId(device.id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isSelected && device.status === 'connected'
                          ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{device.icon}</span>
                          <div>
                            <h3 className="font-bold text-slate-200 text-sm">{device.name}</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{device.brand}</span>
                          </div>
                        </div>

                        {device.status === 'connected' && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <Battery className="w-3.5 h-3.5" />
                            <span>{device.battery}%</span>
                          </div>
                        )}
                      </div>

                      {/* Connection details and action */}
                      <div className="mt-4 flex justify-between items-center pt-3 border-t border-slate-900">
                        <div>
                          {device.status === 'connected' ? (
                            <span className="text-[10px] text-slate-500 font-mono">Última sinc: {device.syncTime}</span>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono">Não pareado</span>
                          )}
                        </div>

                        {device.status === 'connected' ? (
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-[9px] font-bold font-mono">
                                Ativo
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(device.id);
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                            >
                              Desconectar
                            </button>
                          </div>
                        ) : device.status === 'connecting' ? (
                          <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-semibold">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Emparelhando...</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(device.id);
                            }}
                            className="py-1 px-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                          >
                            Parear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Professional Integration Panel (Caminho C - Terra / Vital) */}
            <div className="bg-gradient-to-br from-slate-900/90 to-indigo-950/80 border border-indigo-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                API Unificada
              </div>
              <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Health API Connect
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Sincronize de forma automática e 100% fidedigna via agregador em nuvem (**Terra API / Vital**). Puxa a medição clínica real validada pelo seu relógio.
              </p>

              {/* API Integration status check */}
              {apiSyncStatus === 'active' ? (
                <div className="bg-emerald-950/35 border border-emerald-500/30 p-4 rounded-2xl mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conectado e Ativo
                    </span>
                    <button
                      onClick={async () => {
                        if (user?.id) {
                          await supabase.from('xzen_user_telemetry_status').upsert({
                            user_id: user.id,
                            sync_status: 'disconnected',
                            last_sync_at: new Date().toISOString()
                          });
                          setApiSyncStatus('disconnected');
                        }
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                    >
                      Desconectar
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <p>Dispositivo: <span className="text-slate-100 font-bold">{apiDeviceName}</span></p>
                    <p>Agregador: <span className="text-slate-100 uppercase">{apiProvider}</span></p>
                  </div>
                </div>
              ) : apiSyncStatus === 'disconnected' || apiSyncStatus === 'error' ? (
                <div className="bg-rose-950/45 border border-rose-500/30 p-4 rounded-2xl mb-4 space-y-2">
                  <span className="text-xs font-bold text-rose-400 block">
                    ⚠️ Conexão de API Expirada
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sua permissão de acesso ao wearable expirou ou foi revogada. Reconecte abaixo para reativar as leituras de VFC.
                  </p>
                </div>
              ) : null}

              <button
                onClick={() => setShowVitalWidget(true)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.01]"
              >
                Conectar via Health API (Terra / Vital)
              </button>
            </div>

            {/* Scientific explanation */}
            <div className="bg-slate-900/20 border border-slate-800/40 rounded-3xl p-6 text-slate-400 text-xs space-y-4">
              <h3 className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Como a VFC indica estresse?
              </h3>
              <p className="leading-relaxed">
                A VFC reflete a variação milimétrica no tempo entre cada batimento cardíaco sucessivo. Quando estamos calmos e regenerando (sistema parassimpático), os batimentos variam bastante (VFC alta). Quando estamos sob ameaça ou sobrecarga (sistema simpático), o coração bate de forma rígida e metronômica (VFC baixa).
              </p>
              <p className="leading-relaxed">
                A estimulação do ponto correspondente ao <strong>Nervo Vago (NC X / Fígado)</strong> no couro cabeludo sinaliza relaxamento e modula diretamente a VFC, neutralizando a resposta inflamatória e o estresse sistêmico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vital / Terra Connection Widget Simulator */}
      {showVitalWidget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => {
                setShowVitalWidget(false);
                setSelectedWidgetDevice('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">🔌</span>
              <h3 className="text-lg font-bold text-slate-100 mt-2">Health API Connector</h3>
              <p className="text-slate-400 text-xs">Conecte seus wearables de forma unificada.</p>
            </div>

            {selectedWidgetDevice === '' ? (
              <div className="space-y-3">
                <p className="text-slate-300 text-xs font-semibold mb-2">Selecione seu Dispositivo:</p>
                {[
                  { id: 'apple', name: 'Apple Watch (HealthKit)', icon: '⌚', sub: 'Requer aplicativo ponte no iOS' },
                  { id: 'oura', name: 'Oura Ring (Nuvem)', icon: '💍', sub: 'Conexão via login em nuvem' },
                  { id: 'garmin', name: 'Garmin Connect', icon: '⛰️', sub: 'Sincronização via nuvem Garmin' },
                  { id: 'google', name: 'Google / Fitbit / Android', icon: '⚡', sub: 'Conexão em nuvem ou Health Connect' }
                ].map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedWidgetDevice(dev.id)}
                    className="w-full flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-950 rounded-xl transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{dev.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{dev.name}</p>
                        <p className="text-[10px] text-slate-500">{dev.sub}</p>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-bold">»</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {selectedWidgetDevice === 'apple' && (
                  <div className="space-y-4 text-center">
                    <p className="text-slate-300 text-xs leading-relaxed text-left">
                      💡 **Nota sobre Apple Watch:** O iOS restringe leituras locais. Para conectar, escaneie o QR Code abaixo com seu celular para vincular o app de saúde ao nosso agregador de nuvem:
                    </p>
                    <div className="bg-white p-3 rounded-2xl w-36 h-36 mx-auto flex items-center justify-center border border-slate-200">
                      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black rounded opacity-85" style={{ width: '100%', height: '100%', display: 'block', backgroundImage: "url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tryterra.co/healthkit/bridge/xzenpress')" }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Escaneie para instalar o app ponte e conceder permissões do HealthKit.
                    </p>
                  </div>
                )}

                {selectedWidgetDevice !== 'apple' && (
                  <div className="space-y-4">
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Você será redirecionado para a autenticação OAuth segura do fabricante para dar autorização de leitura.
                    </p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-center text-xs text-slate-400">
                      Conexão em nuvem ativa por OAuth 2.0 SSL
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConnectWidgetDevice(selectedWidgetDevice)}
                    disabled={isConnectingWidget}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isConnectingWidget ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sincronizando...</span>
                      </>
                    ) : (
                      <span>Vincular Conta</span>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedWidgetDevice('')}
                    disabled={isConnectingWidget}
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl font-bold transition-all"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proactive Biofeedback Overlay Alert (Glassmorphic Warning) */}
      {showNotification && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-red-500/40 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative overflow-hidden animate-scale-up">
            {/* Animated warning rings */}
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <button
              onClick={() => {
                setShowNotification(false);
                setNotificationDismissed(true);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>

            <div className="flex gap-4 items-start mb-6">
              <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-2xl text-red-500 shrink-0 animate-bounce">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Urgência Autônoma
                </span>
                <h3 className="text-xl font-extrabold text-slate-100 mt-2">
                  Sobrecarga Fisiológica Detectada!
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
              <p>
                Os dados de telemetria integrados mostram uma queda severa na sua **Variabilidade da Frequência Cardíaca (VFC = {vfcValue} ms)** e uma elevação no estresse celular oculto.
              </p>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs space-y-2">
                <p className="font-semibold text-slate-200">💡 Resposta de Biofeedback Sugerida:</p>
                <p>
                  Recomendamos a estimulação preventiva do acuponto **{recommended.pointName}**. {recommended.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigateToAcupoint(recommended.pointId)}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-slate-55 font-bold rounded-xl text-sm transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-red-950/30 flex items-center justify-center gap-2"
              >
                <span>Estimular Ponto Agora</span>
                <span className="text-xs font-mono font-normal opacity-85">({recommended.labelSuffix})</span>
              </button>
              <button
                onClick={() => {
                  setShowNotification(false);
                  setNotificationDismissed(true);
                }}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
