import React, { useState, useEffect } from 'react';
import { NewChapterFlow } from '../components/evolution/NewChapterFlow';
import { DraftReviewCard } from '../components/evolution/DraftReviewCard';
import { ChapterHistory } from '../components/evolution/ChapterHistory';
import { EvolutionMirrorEngine } from '../services/evolution/evolutionMirrorEngine';
import { EvolutionObservation, ChapterWithLogs } from '../types/evolution';
import { evolutionEvidenceRepository } from '../services/evolution/evolutionEvidenceRepository';
import { LifeMapCard } from '../components/evolution/LifeMapCard';
import { PracticeCheckIn } from '../components/evolution/PracticeCheckIn';
import { MeaningEngine } from '../services/evolution/meaningEngine';
import { ZenEvent } from '../types/nutriming';
import { Chapter, ChapterStatus, PracticeLog, PracticeOutcome } from '../types/evolution';
import { chaptersApi } from '../services/evolution/chaptersApi';
import { practiceLogsApi } from '../services/evolution/practiceLogsApi';
import { practiceService } from '../services/evolution/practiceService';
import { zenEventsApi } from '../services/evolution/zenEventsApi';
import { choiceService } from '../services/evolution/choiceService';
import { ChoiceMoment } from '../components/evolution/ChoiceMoment';
import { ChoiceRecord } from '../types/evolution';
import { ZenEventBridge } from '../services/evolution/zeneventbridge';
import { Leaf, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const HumanEvolutionDashboard: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChoiceMoment, setShowChoiceMoment] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'history'>('dashboard');
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [evolutionObservations, setEvolutionObservations] = useState<EvolutionObservation[]>([]);
  const [evolutionDataset, setEvolutionDataset] = useState<ChapterWithLogs[]>([]);
  const [zenEvents, setZenEvents] = useState<ZenEvent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const chapter = await chaptersApi.fetchActiveChapter();
          setActiveChapter(chapter);
          if (chapter) {
            const logs = await practiceLogsApi.fetchLogsForChapter(chapter.id);
            setPracticeLogs(logs);
          }
          const events = await zenEventsApi.fetchAllUserEvents(user.id);
          setZenEvents(events);
        }
      } catch (err) {
        console.error("Failed to load evolution data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChapterComplete = async (chapter: Chapter) => {
    if (!userId) {
      alert("Por favor, faça login primeiro.");
      return;
    }
    try {
      const savedChapter = await chaptersApi.createChapter(chapter, userId);
      setActiveChapter(savedChapter);
      setPracticeLogs([]); // New chapter has no logs yet
    } catch (err) {
      console.error("Erro ao criar capítulo:", err);
      alert("Erro ao salvar o capítulo.");
    }
  };

  const handleDraftDecision = async (status: ChapterStatus, reflection: string) => {
    if (!activeChapter || !userId) return;
    
    try {
      // 1. Atualizar banco
      await chaptersApi.updateChapterStatus(activeChapter.id, status);
      
      // 2. Criar o ZenEvent macro para o motor temporal (fire and forget na API do Supabase, aqui apenas lógica local)
      const reviewEvent = ZenEventBridge.createChapterReviewEvent(
        userId,
        activeChapter,
        status,
        reflection,
        practiceLogs.length
      );
      console.log("Gerado ZenEvent de revisão:", reviewEvent);
      // Aqui faríamos: await supabase.from('zen_events').insert(...) se a tabela existisse

      // 3. Atualizar UI
      setActiveChapter({ ...activeChapter, status });
    } catch (err) {
      console.error("Erro ao atualizar decisão:", err);
      alert("Falha ao salvar sua decisão.");
    }
  };


  const handleChoiceComplete = async (
    data: Omit<ChoiceRecord, 'id' | 'userId' | 'chapterId' | 'occurredAt'>
  ) => {
    if (!activeChapter || !userId) return;
    try {
      await choiceService.recordChoice(
        userId,
        activeChapter,
        data.choiceOutcome,
        data.trigger,
        data.reflection
      );
      setShowChoiceMoment(false);
      const events = await zenEventsApi.fetchAllUserEvents(userId);
      setZenEvents(events);
    } catch (err) {
      console.error('Falha ao registrar escolha:', err);
    }
  };

  const handlePracticeLog = async (outcome: PracticeOutcome, reflection: string) => {
    if (!activeChapter || !userId) return;
    try {
      await practiceService.recordPractice(userId, activeChapter, outcome, reflection);
      
      // Recarrega os logs para o MeaningEngine atualizar na hora
      const logs = await practiceLogsApi.fetchLogsForChapter(activeChapter.id);
      setPracticeLogs(logs);
      const events = await zenEventsApi.fetchAllUserEvents(userId);
      setZenEvents(events);
      
      console.log('Prática registrada com sucesso!');
    } catch (err) {
      console.error('Falha ao registrar prática:', err);
      alert('Houve um erro ao salvar sua prática.');
    }
  };

  // Conversão rápida dos PracticeLogs reais para ZenEvents
 para o MeaningEngine ler (em vez dos mocks duros anteriores)
  const convertedEvents: ZenEvent[] = practiceLogs.map(log => ZenEventBridge.createPracticeEvent(userId || 'anon', log));
  const observations = activeChapter ? MeaningEngine.interpret(convertedEvents, activeChapter) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-light text-white mb-2">Evolução Humana</h1>
          <p className="text-slate-400">
            A história conta o que fomos. Os registros mostram o que fazemos.<br />
            As escolhas constroem o que seremos.
          </p>
        </header>

        {!activeChapter ? (
          <NewChapterFlow onComplete={handleChapterComplete} />
        ) : (
          <div className="space-y-8">
            
            {/* SPRINT 8: LOOP DE PRÁTICA DIÁRIA */}
            {(activeChapter.status === 'draft' || activeChapter.status === 'active') && !showChoiceMoment && (
              <PracticeCheckIn 
                chapter={activeChapter} 
                onLog={handlePracticeLog} 
              />
            )}

            {/* SPRINT 10: CHOICE ENGINE — Botão discreto, não intrusivo */}
            {(activeChapter.status === 'draft' || activeChapter.status === 'active') && !showChoiceMoment && (
              <div className="text-center">
                <button
                  onClick={() => setShowChoiceMoment(true)}
                  className="text-sm text-blue-400/60 hover:text-blue-300 transition-colors border border-blue-900/20 hover:border-blue-700/40 px-4 py-2 rounded-full"
                >
                  ✦ Percebi um padrão agora
                </button>
              </div>
            )}

            {/* SPRINT 10: CHOICE MOMENT — Abre quando botão é clicado */}
            {showChoiceMoment && (
              <ChoiceMoment
                onComplete={handleChoiceComplete}
                onCancel={() => setShowChoiceMoment(false)}
              />
            )}

            {/* O CARD DE REVISÃO DO DRAFT */}
            {activeChapter.status === 'draft' && new Date() > new Date(activeChapter.draftUntil || '') && (
               <DraftReviewCard 
                 chapter={activeChapter}
                 practiceCount={practiceLogs.length}
                 onDecision={handleDraftDecision}
                 onPostpone={() => console.log('O usuário escolheu decidir depois. Nada bloqueia.')}
               />
            )}

            {/* O ESPELHO DA VIDA: Fica visível se tivermos logs para mostrar as Observações, independente de status (Lei 9) */}
            {activeChapter.status !== 'draft' && (
               <LifeMapCard observations={observations} />
            )}

            {/* CARD DE STATUS - Para controle visual temporário */}
            <div className="max-w-xl mx-auto p-8 bg-[#0a1411] rounded-3xl border border-emerald-900/50 text-center mt-8 relative">
               <h2 className="text-2xl font-serif text-emerald-50 mb-4">
                 Status: {activeChapter.status.toUpperCase()}
               </h2>
               {activeChapter.status === 'draft' ? (
                 <p className="text-emerald-100/70 mb-6">
                    Seu rascunho expira em: {new Date(activeChapter.draftUntil!).toLocaleDateString()}
                 </p>
               ) : (
                 <p className="text-emerald-100/70 mb-6 italic font-serif">
                   {activeChapter.status === 'completed' && "A prática permanece na sua história."}
                   {activeChapter.status === 'paused' && "Parar por um tempo também faz parte de uma trajetória."}
                   {activeChapter.status === 'active' && "Novo ciclo iniciado. O rascunho terminou."}
                 </p>
               )}
               <button 
                  onClick={() => setActiveChapter(null)} 
                  className="px-6 py-2 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 rounded-full transition-colors"
               >
                  Ver Novo Fluxo
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
