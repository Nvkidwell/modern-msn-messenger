import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface WinkPlayerProps {
  activeWink: {
    winkId: string;
    senderName: string;
  } | null;
  onFinished: () => void;
}

export const WinkPlayer: React.FC<WinkPlayerProps> = ({ activeWink, onFinished }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!activeWink) {
      setStage(0);
      return;
    }

    setStage(1);

    if (activeWink.winkId === 'glitter') {
      confetti({
        particleCount: 150,
        spread: 90,
        colors: ['#ff007f', '#00f0ff', '#39ff14', '#ffffff', '#e11d48'],
        origin: { y: 0.6 },
      });
    }

    const timer = setTimeout(() => {
      setStage(2);
      setTimeout(() => {
        onFinished();
      }, 400);
    }, 2800);

    return () => clearTimeout(timer);
  }, [activeWink, onFinished]);

  if (!activeWink || stage === 0) return null;

  const renderWinkContent = () => {
    switch (activeWink.winkId) {
      case 'shatter':
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(244,63,94,0.9)] animate-bounce-in select-none">
              💔
            </div>
            <div className="mt-4 px-6 py-2 bg-black/90 text-rose-400 rounded-full font-mono font-extrabold text-lg border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] uppercase tracking-wider animate-pulse">
              * HEART SHATTERED INTO SHARDS *
            </div>
          </div>
        );

      case 'rawr':
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(34,197,94,0.8)] animate-bounce select-none">
              🦖
            </div>
            <div className="mt-4 px-5 py-2 bg-black/90 text-emerald-400 rounded-2xl font-mono font-extrabold text-base border-2 border-emerald-500 shadow-xl tracking-wider text-center">
              xD RAWR MEANS I LOVE YOU IN DINOSAUR!! &lt;3
            </div>
          </div>
        );

      case 'mascara':
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_25px_rgba(0,0,0,0.9)] select-none animate-pulse">
              👁️🖤
            </div>
            <div className="mt-4 px-5 py-2 bg-zinc-950 text-zinc-300 rounded-full font-mono font-bold text-sm border border-zinc-700 shadow-xl tracking-wider">
              * CRYING BLACK EYELINER TEARS *
            </div>
          </div>
        );

      case 'lightning':
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_35px_rgba(0,240,255,0.9)] select-none animate-ping">
              ⚡
            </div>
            <div className="mt-4 px-5 py-2 bg-black/90 text-cyan-300 rounded-full font-mono font-extrabold text-lg border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.6)] tracking-widest uppercase">
              STATIC SHOCK WAVE!
            </div>
          </div>
        );

      case 'poison':
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(244,63,94,0.9)] select-none animate-spin duration-1000">
              ☠️
            </div>
            <div className="mt-4 px-5 py-2 bg-zinc-950 text-rose-400 rounded-full font-mono font-bold text-base border-2 border-rose-600 shadow-xl tracking-wider">
              TOXIC RADIOACTIVE CURSE
            </div>
          </div>
        );

      case 'glitter':
      default:
        return (
          <div className="flex flex-col items-center">
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(217,70,239,0.9)] select-none animate-bounce">
              ✨🖤
            </div>
            <div className="mt-4 px-5 py-2 bg-black/90 text-fuchsia-300 rounded-full font-mono font-extrabold text-lg border-2 border-fuchsia-500 shadow-xl tracking-wider">
              GLITTER & GLOOM EXPLOSION!
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-opacity duration-300 ${
        stage === 2 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />

      <div className="relative z-10 flex flex-col items-center justify-center p-6 transform scale-110">
        <div className="mb-3 px-4 py-1 bg-zinc-900 border border-zinc-700 rounded-full shadow-md text-xs font-mono font-bold text-zinc-200">
          ⚡ {activeWink.senderName} triggered a Scene Blast!
        </div>
        {renderWinkContent()}
      </div>
    </div>
  );
};
