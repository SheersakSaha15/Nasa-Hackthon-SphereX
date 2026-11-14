import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Gauge, 
  Calendar 
} from 'lucide-react';
import type { ViewMode } from '../types';

interface PlayerBarProps {
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  currentEpoch: number;
  setCurrentEpoch: (epoch: number) => void;
  fps: number;
  setFps: (fps: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  isPlaying,
  setIsPlaying,
  currentEpoch,
  setCurrentEpoch,
  fps,
  setFps,
  viewMode,
  setViewMode,
}) => {
  const epochs = [
    { index: 0, label: "Epoch 1", date: "2015" },
    { index: 1, label: "Epoch 2", date: "2017" },
    { index: 2, label: "Epoch 3", date: "2020" },
  ];

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentEpoch((currentEpoch - 1 + epochs.length) % epochs.length);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentEpoch((currentEpoch + 1) % epochs.length);
  };

  return (
    <div className="w-full bg-[#07090e]/95 backdrop-blur-xl border-t border-white/[0.1] px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 select-none shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {/* Left: Playback & Step Controls */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={handleStepBack}
          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-zinc-300 hover:text-white border border-white/10 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          title="Step Backward (Previous Epoch)"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (viewMode !== 'blink') setViewMode('blink');
            setIsPlaying(!isPlaying);
          }}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-white via-zinc-100 to-zinc-200 hover:from-zinc-100 hover:to-white text-black font-bold flex items-center gap-1.5 text-xs shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:shadow-[0_0_28px_rgba(255,255,255,0.55)] transition-all cursor-pointer"
          title="Play / Pause Blink Loop (Space)"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play Blink</span>
            </>
          )}
        </button>

        <button
          onClick={handleStepForward}
          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 text-zinc-300 hover:text-white border border-white/10 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          title="Step Forward (Next Epoch)"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Epoch Timeline Selector */}
      <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-inner">
        <span className="text-[10px] font-mono text-zinc-400 px-2 hidden md:flex items-center gap-1">
          <Calendar className="w-3 h-3 text-cyan-400" />
          Epoch:
        </span>
        {epochs.map((ep) => {
          const isActive = currentEpoch === ep.index && viewMode === 'blink';
          return (
            <button
              key={ep.index}
              onClick={() => {
                setCurrentEpoch(ep.index);
                if (viewMode !== 'blink') setViewMode('blink');
              }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>{ep.label}</span>
              <span className="text-[10px] ml-1 opacity-75">({ep.date})</span>
            </button>
          );
        })}
      </div>

      {/* Right: Blink Speed (FPS) Slider */}
      <div className="flex items-center space-x-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 w-full sm:w-auto shadow-inner">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
          <Gauge className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
          <span>Speed:</span>
        </div>

        <input
          type="range"
          min={0.5}
          max={6.0}
          step={0.5}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
        />

        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.25)] min-w-[56px] text-center">
          {fps.toFixed(1)} FPS
        </span>
      </div>
    </div>
  );
};
