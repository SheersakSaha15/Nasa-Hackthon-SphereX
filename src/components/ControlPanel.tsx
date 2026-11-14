import React from 'react';
import type { 
  AstroTarget, 
  ViewMode 
} from '../types';
import { OFFICIAL_TARGETS } from '../data/targets';
import { 
  Search, 
  Compass, 
  Layers, 
  Eye, 
  Sparkles, 
  Maximize2, 
  Sliders, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

interface ControlPanelProps {
  currentTarget: AstroTarget;
  onSelectTarget: (target: AstroTarget) => void;
  raInput: string;
  decInput: string;
  setRaInput: (val: string) => void;
  setDecInput: (val: string) => void;
  onSearchCoordinates: () => void;
  isCustomCoords: boolean;
  fovArcmin: number;
  setFovArcmin: (val: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  inverted: boolean;
  setInverted: (val: boolean) => void;
  showMotionVector: boolean;
  setShowMotionVector: (val: boolean) => void;
  detectorBand: number;
  setDetectorBand: (band: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentTarget,
  onSelectTarget,
  raInput,
  decInput,
  setRaInput,
  setDecInput,
  onSearchCoordinates,
  isCustomCoords,
  fovArcmin,
  setFovArcmin,
  viewMode,
  setViewMode,
  inverted,
  setInverted,
  showMotionVector,
  setShowMotionVector,
  detectorBand,
  setDetectorBand,
}) => {
  const getFovDescription = (fov: number) => {
    if (fov <= 8) return "🔬 Close-up (Single star/brown dwarf core)";
    if (fov <= 18) return "🔭 Standard (Star & immediate stellar neighborhood)";
    if (fov <= 35) return "🌕 Lunar Scale (Approx. width of the Full Moon)";
    return "🌌 Wide-Angle (Tracking fast asteroids & comets across epochs)";
  };

  return (
    <div className="w-full lg:w-80 bg-[#07090e]/95 backdrop-blur-xl border-r border-white/[0.1] flex flex-col h-full overflow-y-auto p-4 space-y-5 select-none shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
      {/* Section 1: Coordinates Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            Sky Coordinates (RA & Dec)
          </label>
          <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">J2000 WCS</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Right Ascension</span>
            <input
              type="text"
              value={raInput}
              onChange={(e) => setRaInput(e.target.value)}
              placeholder="08h 55m 10s"
              className="w-full bg-black/60 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Declination</span>
            <input
              type="text"
              value={decInput}
              onChange={(e) => setDecInput(e.target.value)}
              placeholder={'-07° 14\' 42"'}
              className="w-full bg-black/60 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
            />
          </div>
        </div>

        <button
          onClick={onSearchCoordinates}
          className="w-full bg-gradient-to-r from-white/[0.06] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] text-zinc-200 hover:text-white border border-white/15 hover:border-cyan-400/50 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)]"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          Fetch Sky Cutout
        </button>
      </div>

      {/* Section 2: Official NASA Challenge Test Targets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
            Official Benchmark Targets
          </label>
          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            NASA CORE
          </span>
        </div>

        <div className="space-y-1.5">
          {OFFICIAL_TARGETS.map((target) => {
            const isSelected = currentTarget.id === target.id && !isCustomCoords;
            const dotColor = 
              target.category === 'proper-motion' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
              target.category === 'brown-dwarf' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-purple-400 shadow-[0_0_8px_#c084fc]';
            const badgeStyle = 
              target.category === 'proper-motion' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
              target.category === 'brown-dwarf' ? 'bg-amber-950/40 text-amber-300 border-amber-500/30' : 'bg-purple-950/40 text-purple-300 border-purple-500/30';
            const categoryLabel = 
              target.category === 'proper-motion' ? 'Fast Star' :
              target.category === 'brown-dwarf' ? 'Brown Dwarf' : 'Variable';

            return (
              <button
                key={target.id}
                onClick={() => onSelectTarget(target)}
                className={`w-full text-left p-2.5 rounded-lg transition-all flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/15 via-white/[0.04] to-transparent border-l-2 border-l-cyan-400 border-y border-r border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.18)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] hover:border-white/15 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {target.name}
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]" />}
                  </span>
                  <span className={`text-[9px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                    {categoryLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="text-zinc-500">{target.raString.split(' ')[0]} {target.decString.split(' ')[0]}</span>
                  <span className="text-zinc-300 font-sans font-medium">
                    {target.properMotion ? `~${target.properMotion.totalArcsecPerYear}"/yr` : target.variability?.type.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Field of View (FOV) Slider */}
      <div className="space-y-2.5 bg-black/40 backdrop-blur-md p-3.5 rounded-lg border border-white/[0.1] shadow-inner">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            Field of View (FOV)
          </label>
          <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            {fovArcmin}' ({ (fovArcmin / 60).toFixed(2) }°)
          </span>
        </div>

        <input
          type="range"
          min={5}
          max={60}
          step={1}
          value={fovArcmin}
          onChange={(e) => setFovArcmin(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
          <button onClick={() => setFovArcmin(5)} className="hover:text-cyan-300 transition-colors">5' Core</button>
          <button onClick={() => setFovArcmin(15)} className="hover:text-cyan-300 transition-colors">15' Default</button>
          <button onClick={() => setFovArcmin(30)} className="hover:text-cyan-300 transition-colors">30' Moon</button>
          <button onClick={() => setFovArcmin(60)} className="hover:text-cyan-300 transition-colors">60' 1° Wide</button>
        </div>

        <p className="text-[10px] text-cyan-200/80 bg-cyan-950/30 p-2 rounded border border-cyan-500/20 leading-tight font-mono">
          {getFovDescription(fovArcmin)}
        </p>
      </div>

      {/* Section 4: Display & Detection Modes */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
          Detection Mode
        </label>

        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-lg border border-white/10 shadow-inner">
          <button
            onClick={() => setViewMode('blink')}
            className={`py-1.5 text-center rounded text-xs font-medium transition-all ${
              viewMode === 'blink'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.35)] font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Blink
          </button>
          <button
            onClick={() => setViewMode('difference')}
            className={`py-1.5 text-center rounded text-xs font-medium transition-all ${
              viewMode === 'difference'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.35)] font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Subtract Epoch 1 from Epoch 2 to highlight changing objects"
          >
            Subtract
          </button>
          <button
            onClick={() => setViewMode('coadd')}
            className={`py-1.5 text-center rounded text-xs font-medium transition-all ${
              viewMode === 'coadd'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_14px_rgba(6,182,212,0.35)] font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Sum epochs together to boost signal-to-noise ratio"
          >
            Co-add
          </button>
        </div>

        {/* View Enhancements & Invert */}
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/30 text-xs cursor-pointer hover:bg-white/[0.05] transition-all">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              Astronomer Negative (Invert)
            </span>
            <input
              type="checkbox"
              checked={inverted}
              onChange={(e) => setInverted(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/30 text-xs cursor-pointer hover:bg-white/[0.05] transition-all">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
              Gaia Motion Vector (+5yr)
            </span>
            <input
              type="checkbox"
              checked={showMotionVector}
              onChange={(e) => setShowMotionVector(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* Section 5: SPHEREx 6-Detector Infrared Bandpass Filter */}
      <div className="space-y-2 pt-2 border-t border-white/[0.1]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            Infrared Bandpass
          </label>
          <span className="text-[10px] text-cyan-400/90 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">102 Bands</span>
        </div>

        <select
          value={detectorBand}
          onChange={(e) => setDetectorBand(Number(e.target.value))}
          className="w-full bg-black/70 border border-white/15 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
        >
          <option value={0}>All Bands Composite (0.75 - 5.00 µm)</option>
          <option value={1}>Detectors 1 & 2 (0.75 - 1.86 µm) - Near-IR Optical</option>
          <option value={2}>Detectors 3 & 4 (1.86 - 3.82 µm) - Water & CO2 Ice</option>
          <option value={3}>Detectors 5 & 6 (3.82 - 5.00 µm) - Cold Brown Dwarfs & CH4</option>
        </select>
      </div>
    </div>
  );
};
