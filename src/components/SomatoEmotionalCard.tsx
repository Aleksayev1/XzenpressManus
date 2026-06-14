import React from 'react';

interface SomatoEmotionalCardProps {
  biologicalWear: number;
}

export const SomatoEmotionalCard: React.FC<SomatoEmotionalCardProps> = ({ biologicalWear }) => {
  const getStatus = () => {
    if (biologicalWear > 1.5) {
      return {
        label: 'Carga Alostática Crítica',
        color: 'bg-rose-500',
        textColor: 'text-rose-400',
        bg: 'bg-rose-955/35',
        border: 'border-rose-500/25',
        message: '🚨 Deficiência de Jing do Rim (Água): Seu desgaste alostático crítico está consumindo sua Essência Vital (Jing). Isso aumenta a propensão a sentimentos de insegurança, medo e exaustão espiritual profunda.',
        recommendation: 'Acupressão de Urgência: KD3 (Taixi) + R1 (Yongquan). Áudio: Frequência de 396Hz para aterramento.'
      };
    } else if (biologicalWear >= 1.0) {
      return {
        label: 'Sobrecarga Leve',
        color: 'bg-amber-500',
        textColor: 'text-amber-400',
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/20',
        message: '⚠️ Estagnação do Qi (Fígado) / Fogo no Coração: O estresse moderado gera calor interno acumulado, intensificando a ansiedade, agitação mental e irritação.',
        recommendation: 'Pratique a técnica de respiração 4-7-8 para restaurar o equilíbrio do sistema nervoso autônomo.'
      };
    } else {
      return {
        label: 'Recuperação Profunda',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        bg: 'bg-emerald-950/30',
        border: 'border-emerald-500/20',
        message: '🌱 Qi do Baço (Terra) Estabilizado: Sua excelente capacidade de recuperação física nutre a estabilidade energética (Terra), diminuindo a preocupação e ruminação mental.',
        recommendation: 'Mantenha os hábitos atuais para apoiar a regeneração celular contínua.'
      };
    }
  };

  const status = getStatus();

  return (
    <div className={`mt-3 p-3.5 rounded-xl border ${status.border} ${status.bg} transition-all duration-500 text-left`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${status.color} animate-pulse`} />
        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-200 font-medium mb-3">{status.message}</p>
      <div className="pt-2 border-t border-white/10">
        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Protocolo Sugerido</span>
        <p className="text-xs font-semibold text-slate-100 leading-relaxed">{status.recommendation}</p>
      </div>
    </div>
  );
};

export default SomatoEmotionalCard;
