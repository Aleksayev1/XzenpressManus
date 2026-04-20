import React, { useState } from 'react';
import { Star, Send, CheckCircle2, Heart, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackPageProps {
  onPageChange: (page: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de envio para o banco de dados/API
    console.log('Feedback enviado:', { user: user?.email, rating, comment });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Obrigado pelo seu feedback!</h2>
          <p className="text-slate-500 mb-8">Sua opinião é fundamental para evoluirmos a jornada XZenPress e ajudarmos mais pessoas.</p>
          <button 
            onClick={() => onPageChange('home')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => onPageChange('home')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Sua voz importa</h1>
            <p className="opacity-90">Como tem sido sua experiência com a nossa plataforma de medicina integrativa?</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Avaliação por Estrelas */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                Sua nota para o XZenPress
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transform transition-all active:scale-95"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comentário */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                O que você mais gosta ou o que podemos melhorar?
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Conte-nos sua história de alívio ou sugestões..."
                className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700"
              />
            </div>

            {/* Benefícios visíveis */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Heart className="w-4 h-4 text-red-400" /> Foco no Bem-Estar
               </div>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Shield className="w-4 h-4 text-blue-400" /> Privacidade Total
               </div>
            </div>

            <button
              type="submit"
              disabled={rating === 0 || !comment.trim()}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                rating === 0 || !comment.trim() 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
              }`}
            >
              <Send className="w-5 h-5" /> Enviar Feedback
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
           Ao enviar, você nos autoriza a usar seu depoimento (anonimizado se preferir) para incentivar outras pessoas.
        </div>
      </div>
    </div>
  );
};
