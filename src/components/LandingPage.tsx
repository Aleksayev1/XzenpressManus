import React, { useRef, useState, useEffect } from 'react';
import { Play, CheckCircle2, Star, ChevronRight, Dna, Volume2, VolumeX, Wind } from 'lucide-react';
import { startQigongRhythm, stopAllZenAudio } from '../services/zenAudioEngine';

interface LandingPageProps {
  onStart: () => void;
  onStartGuest?: () => void;
}

const HeroAudioPreview: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [phase, setPhase] = useState<'inspire' | 'expire'>('inspire');

  useEffect(() => {
    let session: any = null;
    let timer: any = null;

    if (isPlaying) {
      setTimeLeft(15);
      session = startQigongRhythm((currentPhase) => {
        setPhase(currentPhase);
      }, 0.2);

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsPlaying(false);
            stopAllZenAudio();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopAllZenAudio();
    }

    return () => {
      if (timer) clearInterval(timer);
      stopAllZenAudio();
    };
  }, [isPlaying]);

  return (
    <div className="w-full sm:w-auto flex flex-col items-center gap-2">
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`px-8 py-3.5 rounded-xl font-semibold text-sm w-full sm:w-auto flex items-center justify-center gap-3 transition-all duration-300 ${
          isPlaying
            ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse'
            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              {phase === 'inspire' ? '🌬️ Inspire...' : '🌬️ Expire...'} ({timeLeft}s)
            </span>
          </>
        ) : (
          <>
            <Wind className="w-4 h-4 text-emerald-400" />
            <span>Ouça 15 segundos de som que respira com você</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="w-full max-w-xs bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onStartGuest }) => {
  const scrollRef1 = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-netflix-dark text-white selection:bg-blue-500/30 font-outfit overflow-x-hidden">
      
      {/* 1. HERO (FULL SCREEN) - STARRY NIGHT REFERENCE */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Starry Night Background */}
        <div className="absolute inset-0 bg-starry-night scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-netflix-dark/40 to-netflix-dark"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10 pt-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-slideDown">
            Reduza estresse,<br/>
            <span className="text-blue-400">ansiedade e dores</span> em poucos minutos por dia
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed animate-fadeIn">
            Autocuidado guiado com Inteligência Artificial, acupressão e terapias profundas — direto do seu celular.
          </p>
          
          <div className="flex flex-col items-center gap-4 py-4 animate-fadeIn">
            {/* PRIMARY CTA — Login/Cadastro */}
            <button
              onClick={onStart}
              className="px-12 py-5 btn-starry-primary rounded-xl font-bold text-xl w-full sm:w-auto"
            >
              Começar grátis
            </button>

            {/* SECONDARY CTA — Anamnese sem login */}
            <button
              onClick={onStartGuest}
              className="group relative px-10 py-4 rounded-xl font-semibold text-base w-full sm:w-auto flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                border: '1.5px solid rgba(168,85,247,0.4)',
                color: '#c4b5fd',
                boxShadow: '0 0 30px rgba(168,85,247,0.1)'
              }}
            >
              <Dna className="w-5 h-5 flex-shrink-0 group-hover:animate-pulse" style={{ color: '#a78bfa' }} />
              <span>Salve a representação do seu Avatar de Energia<br className="hidden sm:block" />
                <span className="text-purple-300 font-bold"> para acompanhamento futuro</span>
              </span>
            </button>

            {/* ISCA IMERSIVA 15S — Som de Coerência Cardiorrespiratória */}
            <HeroAudioPreview />

            {/* Ghost — Ver como funciona */}
            <button
              onClick={onStart}
              className="px-8 py-3 text-gray-500 text-sm hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Ver como funciona
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-400 animate-fadeIn">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> IA Inteligente</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> 100% Natural</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Sem compromisso</div>
          </div>

          <div className="pt-12 animate-float">
            <img 
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Woman relaxing" 
              className="max-w-2xl mx-auto rounded-full w-64 h-64 md:w-96 md:h-96 object-cover border-8 border-white/5 shadow-[0_0_100px_rgba(37,99,235,0.2)]"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative z-20 space-y-24 bg-netflix-dark pb-32 pt-16">
        
        {/* 2. "CONTINUE SEU EQUILÍBRIO" (HORIZONTAL STRIP WITH REAL CONTENT) */}
        <section className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Continue seu equilíbrio</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scrollRef1.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button 
                onClick={() => scrollRef1.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="horizontal-scroll no-scrollbar" ref={scrollRef1}>
            {[
              { id: 'zenflow', title: "ZenFlow™", desc: "Sessão de Fluxo Mestre", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" },
              { id: 'zs', title: "Estudo Zusanli (ST36)", desc: "Imunidade e Hormonal", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" },
              { id: 'fusion', title: "Fusão de Sons", desc: "Binaural Focus & Cura", img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80" },
              { id: 'nutriming', title: "Nutriming AI", desc: "Consultor de Regeneração", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" },
              { id: 'zoster', title: "Mapa Zoster", desc: "Suporte Integrativo Herpes", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" }
            ].map((card, i) => (
              <div 
                key={i} 
                onClick={onStart}
                className="scroll-item w-[320px] md:w-[400px] group cursor-pointer"
              >
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-800 relative transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6">
                    <h3 className="font-bold text-xl mb-1 group-hover:text-blue-400 transition-colors tracking-tight">{card.title}</h3>
                    <p className="text-gray-400 text-sm font-light">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. "RESULTADOS RÁPIDOS" - REAL TESTIMONIALS */}
        <section className="px-6 md:px-12 max-w-[1600px] mx-auto">
          <h2 className="text-3xl font-bold mb-10 tracking-tight">Resultados rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Alívio Imediato ZS", author: "Maria, SP", time: "3:00", rating: 5, color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
              { title: "Reset de Ansiedade", author: "João, RG", time: "2:30", rating: 5, color: "border-green-500/30 bg-green-500/5 text-green-400" },
              { title: "Sono Profundo ZenFlow", author: "Helena, SC", time: "5:00", rating: 5, color: "border-purple-500/30 bg-purple-500/5 text-purple-400" },
              { title: "Foco 3min Binaural", author: "Ricardo, PR", time: "3:00", rating: 5, color: "border-pink-500/30 bg-pink-500/5 text-pink-400" }
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={onStart}
                className={`p-8 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${item.color}`}
              >
                <h3 className="font-bold text-2xl mb-1 italic tracking-tight">{item.title}</h3>
                <div className="text-sm opacity-60 mb-8 font-medium">{item.author}</div>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                  <div className="flex text-yellow-400 gap-1">
                    {[...Array(item.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <div className="font-bold text-sm tracking-widest">{item.time} MIN</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FINAL CTA - HIGH CONTRAST */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-4xl mx-auto glass-card-dark p-12 rounded-[40px] text-center space-y-8 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Sua transformação começa com um único fôlego.
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de pessoas que recuperaram o controle da sua saúde física e mental hoje mesmo.
            </p>
            <div className="pt-4 flex flex-col items-center gap-4">
              <button 
                onClick={onStart}
                className="px-12 py-5 btn-starry-primary rounded-xl font-bold text-2xl w-full sm:w-auto"
              >
                Experimentar 7 dias grátis
              </button>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Cancele a qualquer momento • Pagamento seguro
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Branding */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
          <span className="font-bold tracking-widest uppercase text-xs">XZenPress Healthcare 2026</span>
          <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-[10px] tracking-wide max-w-lg mx-auto leading-relaxed">
          O XZenPress não substitui o diagnóstico médico. Consulte sempre o seu profissional de saúde antes de iniciar qualquer terapia complementar.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
