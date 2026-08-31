import React from 'react';
import { EpistemicStatus, Lens } from '../../types/evolution';
import { Activity, Beaker, BookOpen, Sparkles, HelpCircle, Eye, Microscope, Globe, Home, User } from 'lucide-react';

interface EpistemicTagProps {
  status: EpistemicStatus;
  lens?: Lens;
  className?: string;
}

const statusConfig: Record<EpistemicStatus, { label: string; icon: React.ReactNode; colorClass: string }> = {
  observed: {
    label: 'Observado',
    icon: <Activity className="w-3 h-3 mr-1" />,
    colorClass: 'bg-[#11241e] text-emerald-300 border-emerald-900/50',
  },
  scientific: {
    label: 'Evidência científica',
    icon: <Beaker className="w-3 h-3 mr-1" />,
    colorClass: 'bg-[#11241e] text-blue-300 border-blue-900/50',
  },
  traditional: {
    label: 'Referencial tradicional',
    icon: <BookOpen className="w-3 h-3 mr-1" />,
    colorClass: 'bg-[#11241e] text-amber-300 border-amber-900/50',
  },
  interpretive: {
    label: 'Interpretação',
    icon: <Sparkles className="w-3 h-3 mr-1" />,
    colorClass: 'bg-[#11241e] text-purple-300 border-purple-900/50',
  },
  unknown: {
    label: 'Desconhecido',
    icon: <HelpCircle className="w-3 h-3 mr-1" />,
    colorClass: 'bg-[#11241e] text-slate-300 border-slate-800/50',
  }
};

type LensKey = Exclude<Lens, null>;

const lensConfig: Record<LensKey, { label: string; icon: React.ReactNode; colorClass: string }> = {
  scientific: {
    label: 'Lente Científica',
    icon: <Microscope className="w-3 h-3 mr-1" />,
    colorClass: 'bg-slate-900 text-slate-400 border-slate-700',
  },
  philosophical: {
    label: 'Lente Filosófica',
    icon: <Eye className="w-3 h-3 mr-1" />,
    colorClass: 'bg-slate-900 text-slate-400 border-slate-700',
  },
  traditional: {
    label: 'Lente Tradicional',
    icon: <Home className="w-3 h-3 mr-1" />,
    colorClass: 'bg-slate-900 text-slate-400 border-slate-700',
  },
  spiritual: {
    label: 'Lente Espiritual',
    icon: <Globe className="w-3 h-3 mr-1" />,
    colorClass: 'bg-slate-900 text-slate-400 border-slate-700',
  },
  personal: {
    label: 'Seus Registros',
    icon: <User className="w-3 h-3 mr-1" />,
    colorClass: 'bg-slate-900 text-slate-400 border-slate-700',
  }
};

export const EpistemicTag: React.FC<EpistemicTagProps> = ({ status, lens, className = '' }) => {
  const sConf = statusConfig[status];
  const lConf = lens ? lensConfig[lens] : null;
  
  if (!sConf) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${sConf.colorClass} shadow-sm font-sans tracking-wide uppercase`}>
        {sConf.icon}
        <span>{sConf.label}</span>
      </div>
      
      {lConf && (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${lConf.colorClass} opacity-80 hover:opacity-100 transition-opacity font-sans tracking-wide uppercase`}>
          {lConf.icon}
          <span>{lConf.label}</span>
        </div>
      )}
    </div>
  );
};
