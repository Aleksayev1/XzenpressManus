import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

interface MapaVivoIntroProps {
  onComplete: () => void;
}

const STORAGE_KEY = 'xzenpress_mapa_intro_seen_v1';

interface Slide {
  narrator: string;        // emoji do narrador
  narratorName: string;
  color: string;
  text: string;
  subtext?: string;
  bg: string;              // classe de fundo
  particle?: string;       // emoji flutuante
}

const SLIDES: Slide[] = [
  {
    narrator: '🌌',
    narratorName: 'O Universo',
    color: '#a78bfa',
    bg: '#0a0a1a',
    particle: '✨',
    text: 'Existe dentro de você um mundo que poucas pessoas conhecem.',
    subtext: 'Um cosmos de energias, emoções e padrões silenciosos.',
  },
  {
    narrator: '📜',
    narratorName: 'O Conhecimento Antigo',
    color: '#fbbf24',
    bg: '#0f0a00',
    particle: '🌕',
    text: 'Há 3.000 anos, os mestres orientais descobriram algo que a medicina ocidental ainda estuda:',
    subtext: 'O corpo não adoece sozinho. Ele é o palco onde a emoção encena seus conflitos.',
  },
  {
    narrator: '🫀',
    narratorName: 'A Sabedoria do Corpo',
    color: '#ef4444',
    bg: '#120000',
    particle: '💫',
    text: 'Cada órgão carrega uma emoção. Cada emoção deixa uma marca.',
    subtext: 'Raiva crônica fala ao Fígado. Medo antigo fala aos Rins. Preocupação fala ao Baço.',
  },
  {
    narrator: '⚔️',
    narratorName: 'Os Cinco Guardiões',
    color: '#22c55e',
    bg: '#001a00',
    particle: '🌳',
    text: 'São 5 Guardiões que protegem sua vitalidade. Cada um governa um domínio da sua vida.',
    subtext: 'Quando estão em equilíbrio, você floresce. Quando estão fracos, o corpo avisa.',
  },
  {
    narrator: '🪞',
    narratorName: 'O Espelho',
    color: '#3b82f6',
    bg: '#00001a',
    particle: '💧',
    text: 'O que você vai ver agora não é um diagnóstico.',
    subtext: 'É um espelho. A representação viva do seu estado interior neste momento da sua vida.',
  },
  {
    narrator: '🌟',
    narratorName: 'O Mapa',
    color: '#f59e0b',
    bg: '#0a0800',
    particle: '⭐',
    text: 'Esta é a sua vida... representada.',
    subtext: 'Seu Mapa Vivo. Único. Em constante evolução. Como você.',
  },
];

function useTypewriter(text: string, speed: number = 28): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setIsDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isDone };
}

function FloatingParticles({ emoji, color }: { emoji: string; color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-0"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `floatUp ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
            filter: `drop-shadow(0 0 8px ${color}88)`,
          }}
        >
          {emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(20px) scale(0.8); }
          30%  { opacity: 0.6; transform: translateY(-10px) scale(1.1); }
          70%  { opacity: 0.4; transform: translateY(-30px) scale(0.9); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.7); }
        }
      `}</style>
    </div>
  );
}

export function hasSeenMapaVivoIntro(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export const MapaVivoIntro: React.FC<MapaVivoIntroProps> = ({ onComplete }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [subVisible, setSubVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const slide = SLIDES[slideIndex];

  const { displayed: mainText, isDone: mainDone } = useTypewriter(slide.text, 30);
  const { displayed: subText, isDone: _subDone } = useTypewriter(
    subVisible ? (slide.subtext || '') : '',
    22
  );

  // Show subtext after main text finishes
  useEffect(() => {
    setSubVisible(false);
    if (mainDone && slide.subtext) {
      const t = setTimeout(() => setSubVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [mainDone, slide.subtext, slideIndex]);

  const advance = useCallback(() => {
    if (slideIndex < SLIDES.length - 1) {
      setExiting(true);
      setTimeout(() => {
        setSlideIndex(i => i + 1);
        setSubVisible(false);
        setExiting(false);
      }, 350);
    } else {
      // Last slide — complete
      localStorage.setItem(STORAGE_KEY, 'true');
      setExiting(true);
      setTimeout(onComplete, 500);
    }
  }, [slideIndex, onComplete]);

  // Tap anywhere to skip typewriter or advance
  const handleTap = () => {
    advance();
  };

  const isLastSlide = slideIndex === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between select-none"
      style={{
        backgroundColor: slide.bg,
        transition: 'background-color 0.8s ease',
      }}
      onClick={handleTap}
    >
      {/* Floating particles */}
      {slide.particle && (
        <FloatingParticles emoji={slide.particle} color={slide.color} />
      )}

      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: slide.color }}
      />

      {/* Progress dots */}
      <div className="relative z-10 flex gap-2 pt-10 pb-4">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === slideIndex ? 24 : 6,
              height: 6,
              backgroundColor: i <= slideIndex ? slide.color : '#374151',
            }}
          />
        ))}
      </div>

      {/* CENTER: Narrator + Speech bubble */}
      <div
        className="relative z-10 flex flex-col items-center px-6 flex-1 justify-center"
        style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.35s ease' }}
      >
        {/* Narrator avatar */}
        <div
          className="text-7xl mb-6 transition-all duration-700"
          style={{
            filter: `drop-shadow(0 0 24px ${slide.color})`,
            animation: 'narratorPulse 3s ease-in-out infinite',
          }}
        >
          {slide.narrator}
        </div>

        {/* Narrator name */}
        <div
          className="text-xs uppercase tracking-widest mb-4 font-semibold"
          style={{ color: slide.color }}
        >
          {slide.narratorName}
        </div>

        {/* Speech bubble — RPG style */}
        <div
          className="w-full max-w-sm rounded-2xl p-5 relative"
          style={{
            backgroundColor: `${slide.color}12`,
            border: `1px solid ${slide.color}44`,
            boxShadow: `0 0 40px ${slide.color}22, inset 0 0 20px ${slide.color}08`,
          }}
        >
          {/* Bubble pointer */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45"
            style={{
              backgroundColor: slide.bg,
              borderTop: `1px solid ${slide.color}44`,
              borderLeft: `1px solid ${slide.color}44`,
            }}
          />

          {/* Main text */}
          <p className="text-white font-semibold text-lg leading-relaxed text-center min-h-[3.5rem]">
            {mainText}
            {!mainDone && (
              <span
                className="inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse"
                style={{ backgroundColor: slide.color }}
              />
            )}
          </p>

          {/* Subtext */}
          {subVisible && slide.subtext && (
            <p
              className="text-sm leading-relaxed text-center mt-3"
              style={{ color: `${slide.color}cc` }}
            >
              {subText}
            </p>
          )}
        </div>

        {/* Tap hint */}
        <div
          className="flex items-center gap-2 mt-8 text-xs animate-pulse"
          style={{ color: `${slide.color}88` }}
        >
          {isLastSlide ? (
            <>
              <span className="font-semibold text-sm" style={{ color: slide.color }}>
                ✨ Quero ver meu Mapa Vivo
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: slide.color }} />
            </>
          ) : (
            <>
              <span>Toque para continuar</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
        </div>
      </div>

      {/* Skip button */}
      <div className="relative z-10 pb-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            localStorage.setItem(STORAGE_KEY, 'true');
            onComplete();
          }}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-4 py-2"
        >
          Pular introdução
        </button>
      </div>

      <style>{`
        @keyframes narratorPulse {
          0%, 100% { transform: scale(1) translateY(0px); }
          50%       { transform: scale(1.08) translateY(-6px); }
        }
      `}</style>
    </div>
  );
};
