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
    <div className="w-full lg:w-80 bg-[#090A0F] border-r border-white/[0.08] flex flex-col h-full overflow-y-auto p-4 space-y-5 select-none">
      {/* Section 1: Coordinates Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            Sky Coordinates (RA & Dec)
          </label>
          <span className="text-[10px] font-mono text-zinc-500">J2000 WCS</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Right Ascension</span>
            <input
              type="text"
              value={raInput}
              onChange={(e) => setRaInput(e.target.value)}
              placeholder="08h 55m 10s"
              className="w-full bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Declination</span>
            <input
              type="text"
              value={decInput}
              onChange={(e) => setDecInput(e.target.value)}
              placeholder={'-07° 14\' 42"'}
              className="w-full bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={onSearchCoordinates}
          className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/10 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          Fetch Sky Cutout
        </button>
      </div>

      {/* Section 2: Official NASA Challenge Test Targets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Official Benchmark Targets
          </label>
          <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded">
            NASA CORE
          </span>
        </div>

        <div className="space-y-1">
          {OFFICIAL_TARGETS.map((target) => {
            const isSelected = currentTarget.id === target.id && !isCustomCoords;
            const dotColor = 
              target.category === 'proper-motion' ? 'bg-emerald-400' :
              target.category === 'brown-dwarf' ? 'bg-amber-400' : 'bg-purple-400';
            const categoryLabel = 
              target.category === 'proper-motion' ? 'Fast Star' :
              target.category === 'brown-dwarf' ? 'Brown Dwarf' : 'Variable';

            return (
              <button
                key={target.id}
                onClick={() => onSelectTarget(target)}
                className={`w-full text-left p-2 rounded-md transition-all flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-white/[0.07] border-l-2 border-l-blue-500 border-y border-r border-white/10 text-white shadow-sm'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    {target.name}
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                  </span>
                  <span className="text-[9px] font-mono flex items-center gap-1 text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/[0.05]">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                    {categoryLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{target.raString.split(' ')[0]} {target.decString.split(' ')[0]}</span>
                  <span className="text-zinc-300 font-sans">
                    {target.properMotion ? `~${target.properMotion.totalArcsecPerYear}"/yr` : target.variability?.type.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Field of View (FOV) Slider */}
      <div className="space-y-2 bg-black/30 p-3 rounded-lg border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            Field of View (FOV)
          </label>
          <span className="text-xs font-mono font-semibold text-blue-400">
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
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
          <span>5' Core</span>
          <span>15' Default</span>
          <span>30' Moon</span>
          <span>60' 1° Wide</span>
        </div>

        <p className="text-[10px] text-zinc-400 bg-white/[0.03] p-1.5 rounded border border-white/[0.06] leading-tight font-mono">
          {getFovDescription(fovArcmin)}
        </p>
      </div>

      {/* Section 4: Display & Detection Modes */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Detection Mode
        </label>

        <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode('blink')}
            className={`py-1.5 text-center rounded text-xs font-medium transition-all ${
              viewMode === 'blink'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Blink
          </button>
          <button
            onClick={() => setViewMode('difference')}
            className={`py-1.5 text-center rounded text-xs font-medium transition-all ${
              viewMode === 'difference'
                ? 'bg-blue-600 text-white shadow-sm'
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
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Sum epochs together to boost signal-to-noise ratio"
          >
            Co-add
          </button>
        </div>

        {/* View Enhancements & Invert */}
        <div className="space-y-1 pt-1">
          <label className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-xs cursor-pointer hover:bg-white/[0.04] transition-colors">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              Astronomer Negative (Invert)
            </span>
            <input
              type="checkbox"
              checked={inverted}
              onChange={(e) => setInverted(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-xs cursor-pointer hover:bg-white/[0.04] transition-colors">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              Gaia Motion Vector (+5yr)
            </span>
            <input
              type="checkbox"
              checked={showMotionVector}
              onChange={(e) => setShowMotionVector(e.target.checked)}
              className="rounded bg-black border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section 5: SPHEREx 6-Detector Infrared Bandpass Filter */}
      <div className="space-y-2 pt-1 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Infrared Bandpass
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">102 Bands</span>
        </div>

        <select
          value={detectorBand}
          onChange={(e) => setDetectorBand(Number(e.target.value))}
          className="w-full bg-black/50 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/80 transition-colors"
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
