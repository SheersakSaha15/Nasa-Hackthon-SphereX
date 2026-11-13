import React, { useState } from 'react';
import type { AstroTarget, SpectralPoint } from '../types';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Layers, 
  Database 
} from 'lucide-react';

interface SpectrumViewerProps {
  target: AstroTarget;
  inspectedCoords?: { raStr: string; decStr: string } | null;
}

export const SpectrumViewer: React.FC<SpectrumViewerProps> = ({
  target,
  inspectedCoords,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'spectrum' | 'cutouts' | 'archival'>('spectrum');
  const [hoveredPoint, setHoveredPoint] = useState<SpectralPoint | null>(null);

  const points = target.mockSpectrum;
  const cutouts = target.spherexCutouts || [];

  // Chart dimensions
  const chartWidth = 560;
  const chartHeight = 110;
  const padding = { top: 12, right: 16, bottom: 24, left: 32 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const minWl = 0.75;
  const maxWl = 5.00;
  const minFlux = 0.0;
  const maxFlux = 1.0;

  const getX = (wl: number) =>
    padding.left + ((wl - minWl) / (maxWl - minWl)) * innerWidth;
  const getY = (flux: number) =>
    padding.top + innerHeight - ((flux - minFlux) / (maxFlux - minFlux)) * innerHeight;

  // Generate SVG path for 102 points
  const pathD = points && points.length > 0
    ? points.reduce((acc, pt, idx) => {
        const x = getX(pt.wavelength);
        const y = getY(pt.flux);
        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
      }, '')
    : '';

  const areaD = pathD ? `${pathD} L ${getX(maxWl)} ${getY(0)} L ${getX(minWl)} ${getY(0)} Z` : '';

  return (
    <div className="bg-[#090A0F]/95 backdrop-blur-md border-t border-white/[0.08] px-4 py-2 transition-all select-none">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-white/[0.05] border border-white/10 text-blue-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium text-white flex items-center gap-1.5">
              <span>SPHEREx Inspector</span>
              <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> NASA IRSA
              </span>
            </h3>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              Target: <span className="text-zinc-200">{target.name}</span>
              {inspectedCoords && ` • Inspected: [${inspectedCoords.raStr}, ${inspectedCoords.decStr}]`}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Collapse */}
        <div className="flex items-center space-x-1.5">
          <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => { setActiveTab('spectrum'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'spectrum' && isExpanded
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              102-Band SED
            </button>
            <button
              onClick={() => { setActiveTab('cutouts'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'cutouts' && isExpanded
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3 h-3" />
              NASA FITS ({cutouts.length})
            </button>
            <button
              onClick={() => { setActiveTab('archival'); setIsExpanded(true); }}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'archival' && isExpanded
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              WiseView
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title={isExpanded ? "Collapse Inspector" : "Expand Inspector"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Panels */}
      {isExpanded && (
        <div className="mt-2.5">
          {/* TAB 1: 102-Band Spectrum Curve */}
          {activeTab === 'spectrum' && (
            <div className="flex flex-col lg:flex-row items-stretch gap-3">
              {/* Chart Container */}
              <div className="w-full lg:w-3/4 bg-black/50 border border-white/10 rounded-lg p-2.5 relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-28 sm:h-32 overflow-visible"
                >
                  <defs>
                    <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Precision Grid Lines */}
                  <line x1={padding.left} y1={getY(0.5)} x2={chartWidth - padding.right} y2={getY(0.5)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                  <line x1={padding.left} y1={padding.top + innerHeight} x2={chartWidth - padding.right} y2={padding.top + innerHeight} stroke="rgba(255,255,255,0.12)" />

                  {/* Molecular Markers */}
                  <line x1={getX(1.66)} y1={padding.top} x2={getX(1.66)} y2={padding.top + innerHeight} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  <text x={getX(1.66)} y={padding.top + 8} fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">CH4 (1.66µm)</text>

                  <line x1={getX(3.05)} y1={padding.top} x2={getX(3.05)} y2={padding.top + innerHeight} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  <text x={getX(3.05)} y={padding.top + 8} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">H2O Ice (3.05µm)</text>

                  <line x1={getX(4.26)} y1={padding.top} x2={getX(4.26)} y2={padding.top + innerHeight} stroke="#c084fc" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  <text x={getX(4.26)} y={padding.top + 8} fill="#c084fc" fontSize="8" fontFamily="monospace" textAnchor="middle">CO2 Ice (4.26µm)</text>

                  {/* Curves */}
                  <path d={areaD} fill="url(#spectrumGradient)" />
                  <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="1.5" />

                  {/* Wavelength Ticks */}
                  <text x={padding.left} y={chartHeight - 6} fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="start">0.75 µm</text>
                  <text x={getX(2.0)} y={chartHeight - 6} fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="middle">2.0 µm</text>
                  <text x={getX(3.5)} y={chartHeight - 6} fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="middle">3.5 µm</text>
                  <text x={chartWidth - padding.right} y={chartHeight - 6} fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">5.0 µm</text>
                </svg>

                <div className="absolute top-2 right-2 text-[9px] font-mono tracking-wider text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10 uppercase">
                  102 Channels (0.75–5.00 µm)
                </div>
              </div>

              {/* Right Signatures Box */}
              <div className="w-full lg:w-1/4 bg-black/40 p-3 rounded-lg border border-white/10 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1.5">
                    Key Infrared Signatures:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {target.spectralFeatures.map((feat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/[0.04] text-zinc-300 rounded border border-white/10 text-[10px] font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans pt-1 border-t border-white/[0.06]">
                  {target.significance}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Live NASA SPHEREx FITS Cutout Registry */}
          {activeTab === 'cutouts' && (
            <div className="bg-black/50 border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-200 font-medium flex items-center gap-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  NASA/IPAC Caltech Level 2 Observation Cutouts ({cutouts.length} retrieved planes):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  TAP Service: https://irsa.ipac.caltech.edu/TAP
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {cutouts.map((co, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.07] hover:border-white/15 p-2 rounded-md text-[11px] flex flex-col justify-between space-y-1 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200 font-mono text-[10px]">{co.bandpass}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">MJD {parseFloat(co.time_mjd).toFixed(2)}</span>
                    </div>
                    <div className="truncate text-zinc-500 text-[9px] font-mono" title={co.url}>
                      {co.url.split('/').pop()}
                    </div>
                    <a
                      href={co.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded border border-white/10 text-[9px] font-mono transition-colors"
                    >
                      <Download className="w-2.5 h-2.5" />
                      Download FITS
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WiseView Comparative Multi-Epoch Imagery */}
          {activeTab === 'archival' && (
            <div className="bg-black/50 border border-white/10 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-xs">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Multi-Epoch Infrared Cross-Match (WISE / 2MASS / Gaia)
                </h4>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  NASA challenge specifications recommend cross-referencing with <strong>WiseView</strong> to compare historical infrared epochs with current SPHEREx observations.
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href={`http://byw.tools/wiseview#ra=${target.ra}&dec=${target.dec}&size=300&band=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-md text-[11px] font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                    Open in WiseView
                  </a>
                  <a
                    href={`https://archive.stsci.edu/missions-and-data/gaia`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 rounded-md text-[11px] font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                    Inspect Gaia DR3 Catalog
                  </a>
                </div>
              </div>

              {/* Side-by-side snapshot preview */}
              {target.archivalComparison && (
                <div className="flex items-center space-x-2">
                  <div className="text-center">
                    <img
                      src={target.archivalComparison.epoch1_url}
                      alt="AllWISE Infrared"
                      className="w-20 h-20 rounded-md border border-white/10 object-cover"
                    />
                    <span className="text-[9px] text-zinc-500 font-mono block mt-1">AllWISE</span>
                  </div>
                  <div className="text-center">
                    <img
                      src={target.archivalComparison.epoch2_url}
                      alt="2MASS Infrared"
                      className="w-20 h-20 rounded-md border border-white/10 object-cover"
                    />
                    <span className="text-[9px] text-zinc-500 font-mono block mt-1">2MASS</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
