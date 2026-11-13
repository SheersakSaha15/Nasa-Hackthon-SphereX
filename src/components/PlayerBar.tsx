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
    <div className="w-full bg-[#090A0F]/95 backdrop-blur-md border-t border-white/[0.08] px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 select-none">
      {/* Left: Playback & Step Controls */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={handleStepBack}
          className="p-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition-colors"
          title="Step Backward (Previous Epoch)"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (viewMode !== 'blink') setViewMode('blink');
            setIsPlaying(!isPlaying);
          }}
          className="px-3.5 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black font-semibold flex items-center gap-1.5 text-xs shadow-sm transition-all"
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
          className="p-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition-colors"
          title="Step Forward (Next Epoch)"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Epoch Timeline Selector */}
      <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-lg border border-white/10">
        <span className="text-[10px] font-mono text-zinc-500 px-2 hidden md:flex items-center gap-1">
          <Calendar className="w-3 h-3 text-zinc-400" />
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
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{ep.label}</span>
              <span className="text-[10px] ml-1 opacity-70">({ep.date})</span>
            </button>
          );
        })}
      </div>

      {/* Right: Blink Speed (FPS) Slider */}
      <div className="flex items-center space-x-2.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 w-full sm:w-auto">
        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
          <Gauge className="w-3 h-3 text-zinc-400" />
          <span>Speed:</span>
        </div>

        <input
          type="range"
          min={0.5}
          max={6.0}
          step={0.5}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <span className="text-xs font-mono font-medium text-blue-400 w-12 text-right">
          {fps.toFixed(1)} FPS
        </span>
      </div>
    </div>
  );
};
