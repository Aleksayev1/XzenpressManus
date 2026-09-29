import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  X, 
  Download, 
  Copy, 
  Check, 
  Filter, 
  AlertTriangle,
  Flame,
  Info,
  ExternalLink
} from 'lucide-react';
import { MealEvent } from '../../types/nutriming';
import { AuthenticityGuard, AuthenticityLevel } from '../../services/nutriming/authenticityGuard';

interface AuthenticityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealEvents: MealEvent[];
}

export const AuthenticityReportModal: React.FC<AuthenticityReportModalProps> = ({
  isOpen,
  onClose,
  mealEvents
}) => {
  const [filter, setFilter] = useState<'all' | 'adulterated' | 'suspect' | 'genuine'>('all');
  const [copied, setCopied] = useState(false);

  // Mapear cada evento alimentar com a sua avaliação do AuthenticityGuard
  const analyzedProducts = useMemo(() => {
    return mealEvents.map(event => {
      const name = event.product?.name || 'Alimento';
      const bullets = event.stateResult?.western?.bullets || [];
      const ingredientsText = bullets.join(' ');
      
      const guardResult = AuthenticityGuard.evaluate(name, ingredientsText);
      
      // Override se o FoodStateEngine já marcou explicitamente como adulterado
      const isHeadlineFraud = event.stateResult?.personal?.headline?.includes('ADULTERADO') || 
                             event.stateResult?.personal?.headline?.includes('ANÁLOGO');
      
      let effectiveLevel: AuthenticityLevel = guardResult.level;
      if (isHeadlineFraud) {
        effectiveLevel = 'misleading';
      } else if (effectiveLevel === 'unknown') {
        effectiveLevel = event.stateResult?.personal?.compass === 'green' ? 'genuine' : 'suspect';
      }

      return {
        id: event.id,
        createdAt: event.createdAt,
        name,
        level: effectiveLevel,
        guardResult,
        stateResult: event.stateResult,
        mealContext: event.mealContext
      };
    });
  }, [mealEvents]);

  // Estatísticas agregadas
  const stats = useMemo(() => {
    const total = analyzedProducts.length;
    const adulterated = analyzedProducts.filter(p => p.level === 'misleading').length;
    const suspect = analyzedProducts.filter(p => p.level === 'suspect').length;
    const genuine = analyzedProducts.filter(p => p.level === 'genuine').length;
    const purityRate = total > 0 ? Math.round((genuine / total) * 100) : 100;

    return { total, adulterated, suspect, genuine, purityRate };
  }, [analyzedProducts]);

  // Filtragem
  const filteredProducts = useMemo(() => {
    if (filter === 'adulterated') return analyzedProducts.filter(p => p.level === 'misleading');
    if (filter === 'suspect') return analyzedProducts.filter(p => p.level === 'suspect');
    if (filter === 'genuine') return analyzedProducts.filter(p => p.level === 'genuine');
    return analyzedProducts;
  }, [analyzedProducts, filter]);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    const text = [
      `🛡️ RELATÓRIO DE INTEGRIDADE ALIMENTAR & ADULTERAÇÕES — XZenPress Nutriming`,
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `Total de Itens Auditados: ${stats.total}`,
      `Taxa de Pureza Autêntica: ${stats.purityRate}%`,
      `Alimentos Adulterados/Análogos: ${stats.adulterated}`,
      `Alimentos com Ingredientes Suspeitos: ${stats.suspect}`,
      `Alimentos 100% Genuínos: ${stats.genuine}`,
      ``,
      `--- ITENS AUDITADOS ---`,
      ...analyzedProducts.map(p => {
        const flag = p.level === 'misleading' ? '🔴 ADULTERADO' : p.level === 'suspect' ? '🟡 SUSPEITO' : '🟢 GENUÍNO';
        return `[${flag}] ${p.name} (${new Date(p.createdAt).toLocaleDateString('pt-BR')}) - ${p.stateResult?.personal?.headline || ''}`;
      })
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const headers = ['id', 'data_hora', 'produto', 'nivel_autenticidade', 'classificacao', 'detalhes_fraude', 'acao_clinica'];
    const rows = analyzedProducts.map(p => [
      p.id,
      p.createdAt,
      `"${p.name.replace(/"/g, '""')}"`,
      p.level,
      p.level === 'misleading' ? 'Adulterado/Análogo' : p.level === 'suspect' ? 'Suspeito' : 'Genuíno',
      `"${(p.guardResult.fraudTermsFound.join(', ') || p.stateResult?.personal?.headline || '').replace(/"/g, '""')}"`,
      `"${(p.guardResult.clinicalNote || p.stateResult?.personal?.explanation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xzen_relatorio_adulteracoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header com LED de Status */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              {stats.adulterated > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-slate-900"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Relatório de Integridade Alimentar</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                  AuthenticityGuard v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de maquiagem industrial, análogos sintéticos e fraudes de identidade.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo Métrico */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Taxa de Pureza</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black ${stats.purityRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.purityRate}%
              </span>
              <span className="text-[10px] text-slate-500">autênticos</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/30 flex flex-col">
            <span className="text-[11px] text-red-300 font-medium uppercase tracking-wider flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Adulterados
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-red-400">{stats.adulterated}</span>
              <span className="text-[10px] text-red-400/60">críticos</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/30 flex flex-col">
            <span className="text-[11px] text-amber-300 font-medium uppercase tracking-wider">Suspeitos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-400">{stats.suspect}</span>
              <span className="text-[10px] text-amber-400/60">com aditivos</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex flex-col">
            <span className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">Genuínos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.genuine}</span>
              <span className="text-[10px] text-emerald-400/60">100% puros</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter('adulterated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === 'adulterated'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-red-400/80 hover:bg-red-950/30'
              }`}
            >
              🔴 Adulterados ({stats.adulterated})
            </button>
            <button
              type="button"
              onClick={() => setFilter('suspect')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === 'suspect'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400/80 hover:bg-amber-950/30'
              }`}
            >
              🟡 Suspeitos ({stats.suspect})
            </button>
            <button
              type="button"
              onClick={() => setFilter('genuine')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === 'genuine'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-emerald-400/80 hover:bg-emerald-950/30'
              }`}
            >
              🟢 Genuínos ({stats.genuine})
            </button>
          </div>
        </div>

        {/* Lista de Produtos Auditados */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="text-sm font-medium">Nenhum produto encontrado neste filtro.</p>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const isAdulterated = item.level === 'misleading';
              const isSuspect = item.level === 'suspect';
              const isGenuine = item.level === 'genuine';

              const borderColor = isAdulterated
                ? 'border-red-500/50 bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-900'
                : isSuspect
                ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900'
                : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border ${borderColor} transition-all shadow-lg flex flex-col gap-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {isAdulterated && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm shadow-red-950">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Adulterado / Fraude
                          </span>
                        )}
                        {isSuspect && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Atenção / Suspeito
                          </span>
                        )}
                        {isGenuine && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            100% Genuíno
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5">{item.name}</h3>
                    </div>

                    <div className="flex-shrink-0">
                      {isAdulterated && <ShieldX className="w-6 h-6 text-red-400" />}
                      {isSuspect && <ShieldAlert className="w-6 h-6 text-amber-400" />}
                      {isGenuine && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                    </div>
                  </div>

                  {/* Diagnóstico Clínico / Termos Detectados */}
                  {item.guardResult.fraudTermsFound.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-200">
                      <span className="font-bold text-red-300 block mb-1">Substitutos Industriais Detectados:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.guardResult.fraudTermsFound.map((term, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-red-900/60 text-red-200 font-mono text-[11px] font-semibold border border-red-700/50">
                            "{term}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explicação da Fisiologia */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.guardResult.clinicalNote || item.stateResult?.personal?.explanation}
                  </p>

                  {/* Ação ou Recomendações */}
                  {item.stateResult?.personal?.balancingSuggestions && item.stateResult.personal.balancingSuggestions.length > 0 && (
                    <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/30 p-2 rounded-xl flex items-center gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>{item.stateResult.personal.balancingSuggestions[0]}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer com Exportação */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Fechar Relatório
          </button>
        </div>
      </motion.div>
    </div>
  );
};
