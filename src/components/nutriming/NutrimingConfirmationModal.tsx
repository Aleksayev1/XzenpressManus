import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldAlert, Sparkles, Compass, Info, ChevronDown, ChevronUp, Flame, Snowflake, Scale, ExternalLink, Scan, ShieldCheck, ShieldX } from 'lucide-react';
import { FoodStateEngine } from '../../services/nutriming/FoodStateEngine';
import { FoodNormalizer } from '../../services/nutriming/foodNormalizer';
import { MtcFoodClassifier } from '../../services/nutriming/mtcFoodClassifier';
import { TreatmentContextAdapter } from '../../services/nutriming/treatmentContextAdapter';
import { AuthenticityGuard, AuthenticityLevel } from '../../services/nutriming/authenticityGuard';
import { MealContext, FoodStateResult, MealEvent, FoodProduct } from '../../types/nutriming';
import { MealEventsApi } from '../../services/nutriming/mealEventsApi';
import { OpenFoodFactsService } from '../../services/nutriming/openFoodFactsService';

interface NutrimingConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
  extractedFoods: string[];
  barcode?: string;
  onExplorePoint?: (point: string) => void;
}

export const NutrimingConfirmationModal: React.FC<NutrimingConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onReject,
  extractedFoods,
  barcode,
  onExplorePoint
}) => {
  const primaryFoodName = extractedFoods[0] || 'Refeição';
  
  // Modificadores de preparo da refeição em 1 toque
  const [servingTemp, setServingTemp] = useState<MealContext['servingTemperature']>('warm');
  const [mealForm, setMealForm] = useState<MealContext['form']>('baked');
  const [activeTab, setActiveTab] = useState<'decision' | 'balance' | 'understand'>('decision');
  const [isSaving, setIsSaving] = useState(false);
  const [productData, setProductData] = useState<FoodProduct | null>(null);

  // Carregar dados de rótulo reais do Open Food Facts se barcode fornecido
  useEffect(() => {
    if (barcode && isOpen) {
      OpenFoodFactsService.getProductByBarcode(barcode).then(p => {
        if (p) {
          setProductData(p);
        } else {
          setProductData(FoodNormalizer.createCustomOrAiProduct(barcode, primaryFoodName));
        }
      });
    } else {
      setProductData(null);
    }
  }, [barcode, isOpen, primaryFoodName]);

  // 1. Obter estado do usuário e tratamentos ativos
  const userState = useMemo(() => TreatmentContextAdapter.getUserStateVector(), [isOpen]);
  const treatmentContext = useMemo(() => TreatmentContextAdapter.getTreatmentContext(), [isOpen]);

  // 2. Classificar alimento na MTC e Ocidental
  const foodProfile = useMemo(() => {
    return MtcFoodClassifier.classify(primaryFoodName);
  }, [primaryFoodName]);

  // 3. Montar contexto de refeição
  const mealContext: MealContext = useMemo(() => {
    const hour = new Date().getHours();
    let moment: MealContext['moment'] = 'afternoon';
    if (hour >= 5 && hour < 11) moment = 'morning';
    else if (hour >= 11 && hour < 15) moment = 'midday';
    else if (hour >= 18 && hour < 22) moment = 'evening';
    else if (hour >= 22 || hour < 5) moment = 'night';

    return {
      moment,
      form: mealForm,
      servingTemperature: servingTemp
    };
  }, [mealForm, servingTemp]);

  // 4. Executar FoodStateEngine em tempo real (< 5ms)
  const stateResult: FoodStateResult = useMemo(() => {
    return FoodStateEngine.evaluate({
      food: foodProfile,
      meal: mealContext,
      userState,
      treatment: treatmentContext
    });
  }, [foodProfile, mealContext, userState, treatmentContext]);

  // 5. Autenticidade — avalia pelo nome (rápido) e refina com ingredientes quando productData chega
  const authenticityStatus = useMemo((): { level: AuthenticityLevel; message: string; clinicalNote: string; terms: string[] } => {
    // Se já temos dados do rótulo do OFF, usa os warnings injetados lá
    if (productData?.warnings) {
      const confirmed = productData.warnings.find(w => w.type === 'adulteration_confirmed');
      const suspect   = productData.warnings.find(w => w.type === 'adulteration_suspect');
      if (confirmed) return { level: 'misleading', message: confirmed.message, clinicalNote: '', terms: [] };
      if (suspect)   return { level: 'suspect',    message: suspect.message,   clinicalNote: '', terms: [] };
    }
    // Avaliação prévia apenas pelo nome (sem ingredientes)
    const flag = AuthenticityGuard.evaluate(primaryFoodName);
    return { level: flag.level, message: flag.explanation, clinicalNote: flag.clinicalNote, terms: flag.fraudTermsFound };
  }, [productData, primaryFoodName]);


  // 5. Ação de Consumir e Salvar
  const handleConsume = async () => {
    setIsSaving(true);
    const mealEvent: MealEvent = {
      id: `meal_${Date.now()}`,
      userId: 'user_active',
      createdAt: new Date().toISOString(),
      product: {
        foodProductId: foodProfile.id,
        name: primaryFoodName,
        confidence: barcode ? 'known' : 'estimated'
      },
      mealContext,
      stateResult,
      followUp: {
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas
      }
    };

    await MealEventsApi.createMealEvent(mealEvent);
    setIsSaving(false);
    onConfirm();
  };

  if (!isOpen) return null;

  const isCompassRed = stateResult.personal.compass === 'red';
  const isCompassYellow = stateResult.personal.compass === 'yellow';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={onReject}
        />
        
        {/* Card Principal */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl z-10 w-full max-w-lg text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Topo: Nome do Alimento e Badge de Tratamento */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Seu estado encontra seu alimento
              </span>
              <h2 className="text-2xl font-bold text-white mt-1 capitalize">
                {primaryFoodName}
              </h2>
            </div>
            
            {/* Indicador Térmico Rápido */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              foodProfile.tcm.thermalNature === 'hot' || foodProfile.tcm.thermalNature === 'warm'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : foodProfile.tcm.thermalNature === 'cold' || foodProfile.tcm.thermalNature === 'cool'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {foodProfile.tcm.thermalNature === 'hot' || foodProfile.tcm.thermalNature === 'warm' ? (
                <Flame className="w-3.5 h-3.5" />
              ) : foodProfile.tcm.thermalNature === 'cold' || foodProfile.tcm.thermalNature === 'cool' ? (
                <Snowflake className="w-3.5 h-3.5" />
              ) : (
                <Scale className="w-3.5 h-3.5" />
              )}
              Natureza {foodProfile.tcm.thermalNature.toUpperCase()}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              BANNER DE AUTENTICIDADE — pulsante, primeiro impacto visual
          ════════════════════════════════════════════════════════════ */}
          {authenticityStatus.level !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`mb-4 rounded-2xl border overflow-hidden ${
                authenticityStatus.level === 'misleading'
                  ? 'border-rose-500/70 bg-rose-950/50'
                  : authenticityStatus.level === 'suspect'
                  ? 'border-amber-500/60 bg-amber-950/40'
                  : 'border-emerald-500/50 bg-emerald-950/40'
              }`}
            >
              {/* Barra de topo com LED pulsante */}
              <div className={`flex items-center gap-3 px-4 py-3 ${
                authenticityStatus.level === 'misleading'
                  ? 'bg-rose-900/60'
                  : authenticityStatus.level === 'suspect'
                  ? 'bg-amber-900/50'
                  : 'bg-emerald-900/40'
              }`}>
                {/* LED pulsante */}
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    authenticityStatus.level === 'misleading' ? 'bg-rose-400'
                    : authenticityStatus.level === 'suspect'  ? 'bg-amber-400'
                    : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    authenticityStatus.level === 'misleading' ? 'bg-rose-500'
                    : authenticityStatus.level === 'suspect'  ? 'bg-amber-500'
                    : 'bg-emerald-500'
                  }`} />
                </span>

                {/* Ícone */}
                {authenticityStatus.level === 'misleading' ? (
                  <ShieldX className="w-4 h-4 text-rose-300 flex-shrink-0" />
                ) : authenticityStatus.level === 'suspect' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                )}

                {/* Label */}
                <span className={`font-bold text-sm tracking-tight ${
                  authenticityStatus.level === 'misleading' ? 'text-rose-200'
                  : authenticityStatus.level === 'suspect'  ? 'text-amber-200'
                  : 'text-emerald-200'
                }`}>
                  {authenticityStatus.level === 'misleading' ? '🚫 PRODUTO ADULTERADO'
                  : authenticityStatus.level === 'suspect'   ? '⚠️ INGREDIENTE SUSPEITO'
                  : '✅ PRODUTO GENUÍNO'}
                </span>
              </div>

              {/* Corpo da mensagem */}
              <div className="px-4 py-3 text-xs leading-relaxed space-y-1.5">
                <p className={`${
                  authenticityStatus.level === 'misleading' ? 'text-rose-100'
                  : authenticityStatus.level === 'suspect'  ? 'text-amber-100'
                  : 'text-emerald-100'
                }`}>
                  {authenticityStatus.message}
                </p>
                {authenticityStatus.clinicalNote && (
                  <p className="text-slate-400 text-[10px] leading-snug border-t border-white/10 pt-1.5">
                    🧬 {authenticityStatus.clinicalNote}
                  </p>
                )}
              </div>
            </motion.div>
          )}


          {productData && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#091512] border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <Scan className="w-3.5 h-3.5" />
                  <span>Rótulo Verificado (EAN {productData.barcode})</span>
                </div>
                {productData.productBrand && (
                  <span className="text-slate-400 text-[11px] font-medium truncate max-w-[150px]">
                    {productData.productBrand}
                  </span>
                )}
              </div>

              {/* Classificação NOVA */}
              {productData.novaGroup && (
                <div className={`p-2 rounded-xl border flex items-center gap-2 font-medium ${
                  productData.novaGroup === 4
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : productData.novaGroup === 3
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}>
                  <span className="font-bold text-xs">
                    {productData.novaGroup === 4 ? '🔴 NOVA 4 · Ultraprocessado' :
                     productData.novaGroup === 3 ? '🟠 NOVA 3 · Processado' :
                     productData.novaGroup === 2 ? '🟡 NOVA 2 · Ingrediente Culinário' :
                     '🟢 NOVA 1 · In Natura / Minimamente Processado'}
                  </span>
                  <span className="text-[10px] text-slate-300 ml-auto">
                    {productData.additives.length} aditivo(s)
                  </span>
                </div>
              )}

              {/* Alérgenos & Disclaimer de Segurança */}
              {productData.allergens && (
                <div className="text-[10px] text-slate-400 border-t border-emerald-950/80 pt-1.5 leading-tight flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{productData.allergens.safetyDisclaimer}</span>
                </div>
              )}

              {/* Badge de Autenticidade — adulteração / produto maquiado */}
              {productData.warnings?.filter(w => w.type === 'adulteration_confirmed' || w.type === 'adulteration_suspect').map((w, idx) => (
                <div
                  key={idx}
                  className={`mt-1 p-2.5 rounded-xl border flex items-start gap-2 text-[11px] leading-snug ${
                    w.type === 'adulteration_confirmed'
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                      : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{w.message}</span>
                </div>
              ))}
            </div>
          )}


          {/* Badge de Alinhamento com o Tratamento */}
          {stateResult.treatmentAlignment && (
            <div className={`mb-4 p-3 rounded-2xl flex items-start gap-2.5 border text-xs leading-relaxed ${
              stateResult.treatmentAlignment.status === 'conflict'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">
                  {stateResult.treatmentAlignment.badgeText}
                </strong>
                {stateResult.treatmentAlignment.message}
              </div>
            </div>
          )}

          {/* O Card do Encontro (Headline & Explicação) */}
          <div className={`p-4 rounded-2xl mb-4 border transition-all ${
            isCompassRed
              ? 'bg-rose-900/20 border-rose-600/30'
              : isCompassYellow
              ? 'bg-amber-900/20 border-amber-600/30'
              : 'bg-emerald-900/20 border-emerald-600/30'
          }`}>
            <h3 className="font-bold text-sm text-white mb-1">
              {stateResult.personal.headline}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stateResult.personal.explanation}
            </p>
          </div>

          {/* Chips de Preparo Rápido (Modificadores em 1 toque) */}
          <div className="mb-5">
            <span className="text-[11px] font-medium text-slate-400 block mb-2">
              Como vai consumir? (1 toque ajusta a leitura térmica):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setServingTemp('hot'); setMealForm('soup'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  servingTemp === 'hot' && mealForm === 'soup'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🍲 Sopa Quente
              </button>
              <button
                type="button"
                onClick={() => { setServingTemp('warm'); setMealForm('baked'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  servingTemp === 'warm' && mealForm === 'baked'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🍛 Morno / Cozido
              </button>
              <button
                type="button"
                onClick={() => { setServingTemp('cold'); setMealForm('salad'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  servingTemp === 'cold' && mealForm === 'salad'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🥗 Salada Fria / Cru
              </button>
              <button
                type="button"
                onClick={() => { setServingTemp('iced'); setMealForm('drink'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  servingTemp === 'iced'
                    ? 'bg-blue-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🧊 Gelado
              </button>
            </div>
          </div>

          {/* Abas Secundárias: Equilibrar e Entender */}
          {activeTab === 'balance' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 mb-5 text-xs text-slate-300 space-y-2"
            >
              <strong className="text-amber-400 font-bold block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Dicas Práticas de Equilíbrio:
              </strong>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                {stateResult.personal.balancingSuggestions?.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>

              {stateResult.treatmentAlignment?.recommendedPoints && stateResult.treatmentAlignment.recommendedPoints.length > 0 && (
                <div className="pt-2.5 mt-2.5 border-t border-amber-500/20">
                  <span className="text-[11px] text-amber-300 font-semibold block mb-2">
                    📍 Prática de Acupressão Somática para Harmonizar:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {stateResult.treatmentAlignment.recommendedPoints.map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => onExplorePoint && onExplorePoint(pt)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        Estimular Ponto {pt} (1 min)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'understand' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-700 mb-5 text-xs text-slate-300 space-y-2.5"
            >
              <strong className="text-emerald-400 font-bold block mb-1">
                🌿 Perspectiva da Dietoterapia Tradicional Chinesa:
              </strong>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Ação dos 5 Sabores:</span>
                {stateResult.tcm.flavorActions.map((fa, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-800/80 py-1">
                    <span className="capitalize font-medium text-slate-200">{fa.flavor}:</span>
                    <span className="text-emerald-400 font-medium">{fa.actionVerb}</span>
                  </div>
                ))}
              </div>

              {stateResult.ayurveda && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <strong className="text-amber-400 font-bold block mb-1">
                    🪷 Perspectiva Ayurvédica (Doshas & Mente):
                  </strong>
                  <div className="flex justify-between border-b border-slate-800/80 py-1">
                    <span className="text-slate-400">Energia Mental (Guna):</span>
                    <span className="text-amber-300 font-semibold capitalize">{stateResult.ayurveda.guna}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {stateResult.ayurveda.gunaMeaning}
                  </p>
                  <div className="flex justify-between border-b border-slate-800/80 py-1">
                    <span className="text-slate-400">Fogo Digestivo (Agni):</span>
                    <span className="text-emerald-300 font-semibold">{stateResult.ayurveda.agniSummary}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">Impacto nos Doshas: </span>
                    {stateResult.ayurveda.doshaSummary}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic pt-1">
                "Na MTC e no Ayurveda, o alimento é medicina viva: ajusta sua mente, sua digestão e sua vitalidade diária."
              </p>
            </motion.div>
          )}

          {/* BOTÕES DE AÇÃO: CONSUMIR · EQUILIBRAR · ENTENDER */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'balance' ? 'decision' : 'balance')}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeTab === 'balance'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚖️ Equilibrar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'understand' ? 'decision' : 'understand')}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeTab === 'understand'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📖 Entender
            </button>
          </div>

          {/* Botão de Registro Definitivo (1 Toque sem culpa) */}
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <button 
              onClick={onReject}
              disabled={isSaving}
              className="py-3 px-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            
            <button 
              onClick={handleConsume}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 flex justify-center items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Registrando...' : 'Consumir e Acompanhar (1 toque)'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
