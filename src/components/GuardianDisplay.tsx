import React, { useState } from 'react';
import { fiveElements, type GuardianElement, type GuardianScores, getXLIState, getDominantGuardian } from '../data/fiveElements';
import { ChevronDown, Zap, Info } from 'lucide-react';

interface GuardianDisplayProps {
  scores: GuardianScores;
  baselineScores?: GuardianScores;
  xli: number;
  onGuardianClick: (guardian: GuardianElement) => void;
  weeklyCheckinDue?: boolean;
  onStartCheckin?: () => void;
}

const XLI_MILESTONES = [0, 200, 400, 600, 800, 1000];

function getAvatarPosture(xli: number): string {
  if (xli <= 200) return '🧍'; // very weak
  if (xli <= 400) return '🧍';
  if (xli <= 600) return '🧍‍♂️';
  if (xli <= 800) return '💪';
  return '🌟';
}

function getGuardianSize(score: number): string {
  if (score >= 80) return 'scale-125';
  if (score >= 60) return 'scale-110';
  if (score >= 40) return 'scale-100';
  if (score >= 20) return 'scale-90';
  return 'scale-75';
}

function getGuardianOpacity(score: number): number {
  return 0.3 + (score / 100) * 0.7;
}

// Top 3 emotions from scores
function getEmotionCloud(scores: GuardianScores): { label: string; color: string; size: number }[] {
  const sorted = fiveElements
    .map(el => ({ el, score: scores[el.id] }))
    .sort((a, b) => a.score - b.score);

  return sorted.slice(0, 3).map((item, i) => ({
    label: item.el.emotions.imbalanced[0],
    color: item.el.color,
    size: [40, 30, 22][i]
  }));
}

export const GuardianDisplay: React.FC<GuardianDisplayProps> = ({
  scores,
  baselineScores,
  xli,
  onGuardianClick,
  weeklyCheckinDue,
  onStartCheckin
}) => {
  const [hoveredGuardian, setHoveredGuardian] = useState<string | null>(null);
  const xliState = getXLIState(xli);
  const dominant = getDominantGuardian(scores);
  const emotionCloud = getEmotionCloud(scores);

  const guardianLayout = [
    { id: 'madeira', pos: 'top-0 left-1/2 -translate-x-1/2' },      // top center
    { id: 'fogo',    pos: 'top-1/4 right-0' },                        // top right
    { id: 'agua',    pos: 'bottom-1/4 right-0' },                     // bottom right
    { id: 'metal',   pos: 'bottom-1/4 left-0' },                      // bottom left
    { id: 'terra',   pos: 'top-1/4 left-0' },                         // top left
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 py-6 gap-6">

      {/* XLI Badge */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">XZen Longevity Index</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{xli}</span>
            <span className="text-gray-500 text-sm mb-1">/ 1000</span>
          </div>
          {/* Progress bar with milestones */}
          <div className="mt-2 relative">
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${(xli / 1000) * 100}%`,
                  background: 'linear-gradient(to right, #6366f1, #8b5cf6, #a855f7)'
                }}
              />
            </div>
            {/* Milestone dots */}
            <div className="flex justify-between mt-1">
              {XLI_MILESTONES.map(m => (
                <div key={m} className={`w-1 h-1 rounded-full ${xli >= m ? 'bg-purple-400' : 'bg-gray-700'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${xliState.colorClass}`}>{xliState.avatarEmoji}</div>
          <div className={`text-sm font-medium ${xliState.colorClass}`}>{xliState.label}</div>
          <div className="text-xs text-gray-500 max-w-[100px] leading-tight mt-1">{xliState.description}</div>
        </div>
      </div>

      {/* Guardian Pentagram + Avatar */}
      <div className="relative w-72 h-72">
        {/* Central Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-6xl transition-all duration-1000"
              style={{
                filter: `drop-shadow(0 0 ${Math.floor(xli / 50)}px rgba(139,92,246,0.5))`
              }}
            >
              {getAvatarPosture(xli)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{xliState.label}</div>
          </div>
        </div>

        {/* Five Guardians around the avatar */}
        {guardianLayout.map(({ id, pos }) => {
          const el = fiveElements.find(e => e.id === id)!;
          const score = scores[el.id];
          const baselineScore = baselineScores ? baselineScores[el.id] : undefined;
          const isHovered = hoveredGuardian === id;
          const isDominant = dominant.id === id;

          return (
            <button
              key={id}
              className={`absolute ${pos} flex flex-col items-center transition-all duration-300 group ${getGuardianSize(score)}`}
              style={{ transform: pos.includes('translate') ? undefined : undefined }}
              onMouseEnter={() => setHoveredGuardian(id)}
              onMouseLeave={() => setHoveredGuardian(null)}
              onClick={() => onGuardianClick(el)}
              title={el.name}
            >
              {/* Glow ring when weak */}
              {score < 40 && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: el.color, width: 48, height: 48, margin: 'auto' }}
                />
              )}
              {/* Guardian emoji */}
              <div
                className={`text-4xl transition-all duration-500 ${isDominant ? 'animate-pulse' : ''}`}
                style={{
                  opacity: getGuardianOpacity(score),
                  filter: score < 30
                    ? 'grayscale(80%)'
                    : `drop-shadow(0 0 8px ${el.color})`
                }}
              >
                {el.emoji}
              </div>
              {/* Score bar */}
              <div className="w-10 h-1.5 bg-gray-800 rounded-full mt-1 relative overflow-hidden">
                {/* Current score fill */}
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: el.color }}
                />
                {/* Baseline score tick */}
                {baselineScore !== undefined && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-slate-300 shadow-sm animate-pulse"
                    style={{ left: `${baselineScore}%` }}
                    title={`Linha de base inicial: ${baselineScore}%`}
                  />
                )}
              </div>
              {/* Label on hover */}
              {isHovered && (
                <div
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium px-2.5 py-1 rounded-full z-10 flex flex-col items-center leading-none"
                  style={{ backgroundColor: '#111827', color: el.color, border: `1px solid ${el.color}55`, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                >
                  <span className="font-bold text-white mb-0.5">{el.organ}</span>
                  <span className="text-gray-400">
                    Atual: <span className="font-bold text-white">{score}%</span>
                    {baselineScore !== undefined && (
                      <> | Inicial: <span className="font-bold text-slate-400">{baselineScore}%</span></>
                    )}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Emotion Cloud */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Nuvem Emocional</span>
          <Info className="w-3 h-3 text-gray-600" />
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          {emotionCloud.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="rounded-full flex items-center justify-center text-white font-medium transition-all duration-500"
                style={{
                  width: item.size * 2,
                  height: item.size * 2,
                  backgroundColor: item.color + '33',
                  border: `2px solid ${item.color}66`,
                  fontSize: item.size * 0.5
                }}
              >
                {item.label.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">Guardião</div>
            <div className="text-sm font-semibold" style={{ color: dominant.color }}>
              {dominant.emoji} {dominant.organ}
            </div>
            <div className="text-xs text-gray-600">precisa de atenção</div>
          </div>
        </div>
      </div>

      {/* Dominant Guardian Card */}
      <div
        className="w-full rounded-2xl p-4 border"
        style={{
          backgroundColor: dominant.color + '11',
          borderColor: dominant.color + '44'
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{dominant.emoji}</span>
          <div className="flex-1">
            <div className="font-semibold text-white text-sm">{dominant.name}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{ color: dominant.color }}>
              {dominant.weakMessage}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {dominant.plants.slice(0, 2).map(p => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  🌿 {p}
                </span>
              ))}
              {dominant.points.slice(0, 1).map(pt => (
                <span key={pt} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  📍 {pt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Check-in CTA — always visible */}
      {onStartCheckin && (
        <button
          onClick={onStartCheckin}
          className="w-full py-4 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={
            weeklyCheckinDue
              ? {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
                }
              : {
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.3)'
                }
          }
        >
          <span>{weeklyCheckinDue ? '✨' : '📋'}</span>
          {weeklyCheckinDue ? 'Check-in Semanal — 30 segundos' : 'Registrar como estou hoje'}
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Tap guardian hint */}
      <p className="text-xs text-gray-600 text-center">
        Toque em qualquer Guardião para ver seu protocolo completo
      </p>
    </div>
  );
};
