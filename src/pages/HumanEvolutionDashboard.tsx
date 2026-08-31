import React, { useState } from 'react';
import { NewChapterFlow } from '../components/evolution/NewChapterFlow';
import { Chapter } from '../types/evolution';
import { Leaf, ArrowLeft } from 'lucide-react';

export const HumanEvolutionDashboard: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  const handleChapterComplete = (chapter: Chapter) => {
    // In a real app, we would save to Supabase here.
    setActiveChapter(chapter);
  };

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
          <div className="max-w-xl mx-auto p-8 bg-[#0a1411] rounded-3xl border border-emerald-900/50 text-center">
             <h2 className="text-2xl font-serif text-emerald-50 mb-4">Capítulo Iniciado com Sucesso</h2>
             <p className="text-emerald-100/70 mb-6">
                Seu rascunho expira em: {new Date(activeChapter.draftUntil!).toLocaleDateString()}
             </p>
             <button 
                onClick={() => setActiveChapter(null)} 
                className="px-6 py-2 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 rounded-full transition-colors"
             >
                Simular Novo Capítulo
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
