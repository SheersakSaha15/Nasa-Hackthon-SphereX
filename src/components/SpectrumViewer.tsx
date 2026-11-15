import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { AstroTarget, SpectralPoint } from '../types';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Layers, 
  Database,
  Crosshair
} from 'lucide-react';

interface SpectrumViewerProps {
  target: AstroTarget;
  inspectedCoords?: { raStr: string; decStr: string } | null;
}

function getSPHERExBand(wl: number): string {
  if (wl <= 1.86) return 'SPHEREx Band 1-2 (0.75–1.86 µm)';
  if (wl <= 3.82) return 'SPHEREx Band 3-4 (1.86–3.82 µm)';
  return 'SPHEREx Band 5-6 (3.82–5.00 µm)';
}

export const SpectrumViewer: React.FC<SpectrumViewerProps> = ({
  target,
  inspectedCoords,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'spectrum' | 'cutouts' | 'archival'>('spectrum');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const points = target.mockSpectrum;
  const cutouts = target.spherexCutouts || [];

  // Reset selection when target changes
  useEffect(() => {
    setHoveredIndex(null);
    setSelectedIndex(null);
  }, [target.id]);

  // Chart dimensions
  const chartWidth = 560;
  const chartHeight = 110;
  const padding = { top: 18, right: 16, bottom: 24, left: 32 };

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

  // Dynamically extract absorption features and band dips directly from the target spectrum
  const dynamicMarkers = useMemo(() => {
    const groups = new Map<string, { point: SpectralPoint; index: number }>();
    points.forEach((pt, idx) => {
      if (pt.featureName) {
        const existing = groups.get(pt.featureName);
        if (!existing || pt.flux < existing.point.flux) {
          groups.set(pt.featureName, { point: pt, index: idx });
        }
      }
    });
    return Array.from(groups.values());
  }, [points]);

  const getFeatureColor = (featureName?: string, wl?: number) => {
    const name = (featureName || '').toLowerCase();

    // 1. Water Ice / Vapor -> Deep Ocean / Sky Blue (Blue)
    if (name.includes('h2o') || name.includes('water') || name.includes('ice')) {
      return { stroke: '#38bdf8', bg: '#082f49', text: '#e0f2fe' };
    }

    // 2. CH4 / Methane / Hydrocarbons -> Warm Earthy Brown / Amber (Brown)
    if (name.includes('ch4') || name.includes('methane') || name.includes('hydrocarbon')) {
      return { stroke: '#f59e0b', bg: '#78350f', text: '#fef3c7' };
    }

    // 3. CO2 Ice / CO Gas / Carbon Oxides -> Deep Royal Purple (Purple)
    if (name.includes('co2') || name.includes('co ') || name.includes('co bandhead') || name.includes('carbon') || name.includes('co overtone') || name.includes('co fundamental') || name.includes('dioxide')) {
      return { stroke: '#c084fc', bg: '#3b0764', text: '#f5d0fe' };
    }

    // 4. TiO Bands / Titanium / Metals -> Warm Rust / Burnt Amber
    if (name.includes('tio') || name.includes('titanium') || name.includes('metal')) {
      return { stroke: '#fb923c', bg: '#7c2d12', text: '#ffedd5' };
    }

    // 5. NH3 / Ammonia / Silicates / Dust -> Emerald / Teal Green
    if (name.includes('nh3') || name.includes('ammonia') || name.includes('dust') || name.includes('silicate')) {
      return { stroke: '#34d399', bg: '#064e3b', text: '#d1fae5' };
    }

    // Fallback by wavelength
    if (wl && wl >= 3.8) return { stroke: '#c084fc', bg: '#3b0764', text: '#f5d0fe' };
    if (wl && wl >= 2.0) return { stroke: '#38bdf8', bg: '#082f49', text: '#e0f2fe' };
    return { stroke: '#f59e0b', bg: '#78350f', text: '#fef3c7' };
  };

  // Mouse interaction handlers for the SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * chartWidth;

    if (svgX < padding.left || svgX > chartWidth - padding.right) return;

    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const px = getX(pt.wavelength);
      const dist = Math.abs(px - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const px = getX(pt.wavelength);
      const dist = Math.abs(px - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setSelectedIndex((prev) => (prev === closestIdx ? null : closestIdx));
  };

  // Active channel point (either hovered or locked by click)
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activePoint = activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;

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
    <div className="bg-[#07090e]/95 backdrop-blur-xl border-t border-white/[0.1] px-4 py-2 transition-all select-none shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>SPHEREx Inspector</span>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/25 px-1.5 py-0.2 rounded flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> NASA IRSA
              </span>
            </h3>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <p className="text-[11px] text-zinc-400 hidden md:block font-mono">
              Target: <span className="text-cyan-200 font-semibold">{target.name}</span>
              {inspectedCoords && ` • Inspected: [${inspectedCoords.raStr}, ${inspectedCoords.decStr}]`}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Collapse */}
        <div className="flex items-center space-x-1.5">
          <div className="flex bg-black/60 backdrop-blur-md p-0.5 rounded-lg border border-white/10 text-xs shadow-inner">
            <button
              onClick={() => { setActiveTab('spectrum'); setIsExpanded(true); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'spectrum' && isExpanded
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              102-Band SED
            </button>
            <button
              onClick={() => { setActiveTab('cutouts'); setIsExpanded(true); }}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'cutouts' && isExpanded
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3 h-3" />
              NASA FITS ({cutouts.length})
            </button>
            <button
              onClick={() => { setActiveTab('archival'); setIsExpanded(true); }}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                activeTab === 'archival' && isExpanded
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              WiseView
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-zinc-400 hover:text-cyan-300 hover:bg-white/[0.08] transition-colors"
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
              <div className="w-full lg:w-3/4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2.5 relative shadow-inner flex flex-col justify-between">
                {/* Live Real-Time Channel Telemetry Readout */}
                <div className="flex items-center justify-between px-2 py-1 bg-white/[0.03] border border-white/[0.08] rounded-md mb-1.5 text-[10px] font-mono select-none">
                  {activePoint ? (
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                        <strong className="text-white text-[11px]">λ = {activePoint.wavelength.toFixed(3)} µm</strong>
                      </span>
                      <span className="text-zinc-400">Channel: <strong className="text-cyan-200">#{(activeIndex ?? 0) + 1} / 102</strong></span>
                      <span className="text-zinc-400">Flux: <strong className="text-amber-300">{(activePoint.flux * 100).toFixed(1)}%</strong></span>
                      {activePoint.featureName && (() => {
                        const colors = getFeatureColor(activePoint.featureName, activePoint.wavelength);
                        return (
                          <span 
                            style={{ backgroundColor: colors.bg, borderColor: colors.stroke, color: colors.text }}
                            className="px-2 py-0.5 rounded border text-[10px] font-bold shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                          >
                            🔬 {activePoint.featureName}
                          </span>
                        );
                      })()}
                      <span className="text-zinc-500 text-[9px] hidden sm:inline">{getSPHERExBand(activePoint.wavelength)}</span>
                      {selectedIndex !== null && (
                        <button
                          onClick={() => setSelectedIndex(null)}
                          className="text-[9px] text-zinc-400 hover:text-white underline cursor-pointer ml-auto"
                        >
                          Clear Pin
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span>Hover or click across the 102 channels to inspect real-time SPHEREx infrared spectral flux</span>
                    </div>
                  )}
                  <div className="text-[9px] font-mono tracking-wider text-cyan-400/80 uppercase hidden md:block">
                    102 Channels (0.75–5.00 µm)
                  </div>
                </div>

                <div className="relative">
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-28 sm:h-32 overflow-visible cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleSvgClick}
                  >
                    <defs>
                      <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Laser Glow Filter */}
                      <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Precision Grid Lines */}
                    <line x1={padding.left} y1={getY(0.5)} x2={chartWidth - padding.right} y2={getY(0.5)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                    <line x1={padding.left} y1={padding.top + innerHeight} x2={chartWidth - padding.right} y2={padding.top + innerHeight} stroke="rgba(255,255,255,0.12)" />

                    {/* Dynamic Target-Specific Molecular Markers */}
                    {dynamicMarkers.map(({ point: mPt, index: mIdx }, i) => {
                      const mx = getX(mPt.wavelength);
                      const colors = getFeatureColor(mPt.featureName, mPt.wavelength);
                      const isSelected = selectedIndex === mIdx || (activePoint && activePoint.featureName === mPt.featureName);

                      return (
                        <g 
                          key={i} 
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIndex((prev) => (prev === mIdx ? null : mIdx));
                          }}
                        >
                          <line 
                            x1={mx} 
                            y1={padding.top} 
                            x2={mx} 
                            y2={padding.top + innerHeight} 
                            stroke={colors.stroke} 
                            strokeWidth={isSelected ? "1.8" : "1"} 
                            strokeDasharray="3,3" 
                            opacity={isSelected ? "1" : "0.6"} 
                          />
                          <rect 
                            x={mx - 38} 
                            y={padding.top - 5} 
                            width="76" 
                            height="12" 
                            rx="3" 
                            fill={colors.bg} 
                            fillOpacity={isSelected ? "0.95" : "0.75"} 
                            stroke={colors.stroke} 
                            strokeWidth={isSelected ? "1.5" : "0.8"}
                            className="transition-all group-hover:stroke-white"
                          />
                          <text 
                            x={mx} 
                            y={padding.top + 3.5} 
                            fill={colors.text} 
                            fontSize="6.5" 
                            fontWeight="bold" 
                            fontFamily="monospace" 
                            textAnchor="middle"
                            className="group-hover:fill-white"
                          >
                            {mPt.featureName} ({mPt.wavelength.toFixed(2)}µm)
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Area & Dual Glowing Laser Curve */}
                    <path d={areaD} fill="url(#spectrumGradient)" />
                    <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" filter="url(#laserGlow)" opacity="0.9" />
                    <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.95" />

                    {/* Active Scrubbing Channel Crosshair & Highlight Dot */}
                    {activePoint && (
                      <g pointerEvents="none">
                        <line
                          x1={getX(activePoint.wavelength)}
                          y1={padding.top}
                          x2={getX(activePoint.wavelength)}
                          y2={padding.top + innerHeight}
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          strokeDasharray="2,2"
                        />
                        <circle
                          cx={getX(activePoint.wavelength)}
                          cy={getY(activePoint.flux)}
                          r="6.5"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          filter="url(#laserGlow)"
                        />
                        <circle
                          cx={getX(activePoint.wavelength)}
                          cy={getY(activePoint.flux)}
                          r="3"
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    )}

                    {/* Wavelength Ticks */}
                    <text x={padding.left} y={chartHeight - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="start">0.75 µm</text>
                    <text x={getX(2.0)} y={chartHeight - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">2.0 µm</text>
                    <text x={getX(3.5)} y={chartHeight - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">3.5 µm</text>
                    <text x={chartWidth - padding.right} y={chartHeight - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">5.0 µm</text>
                  </svg>
                </div>
              </div>

              {/* Right Signatures Box */}
              <div className="w-full lg:w-1/4 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 flex flex-col justify-between space-y-2 shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold block">
                      Key Infrared Signatures:
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Click to Inspect</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {target.spectralFeatures.map((feat, i) => {
                      const colors = getFeatureColor(feat);
                      const isMatched = activePoint && (
                        (activePoint.featureName && feat.toLowerCase().includes(activePoint.featureName.toLowerCase())) ||
                        feat.toLowerCase().includes(activePoint.wavelength.toFixed(1)) ||
                        feat.toLowerCase().includes(activePoint.wavelength.toFixed(2))
                      );

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            // 1. First try matching by featureName in points
                            let matchedIdx = points.findIndex(
                              (p) => p.featureName && feat.toLowerCase().includes(p.featureName.toLowerCase())
                            );

                            // 2. If not matched by name, match by parsed wavelength (e.g. 0.85, 1.4, 2.3, 3.4)
                            if (matchedIdx === -1) {
                              const wlMatch = feat.match(/([0-9.]+)\s*µ?m/i);
                              if (wlMatch) {
                                const targetWl = parseFloat(wlMatch[1]);
                                let closestDist = Infinity;
                                points.forEach((p, idx) => {
                                  const d = Math.abs(p.wavelength - targetWl);
                                  if (d < closestDist) {
                                    closestDist = d;
                                    matchedIdx = idx;
                                  }
                                });
                              }
                            }

                            if (matchedIdx !== -1) {
                              setSelectedIndex(matchedIdx);
                            }
                          }}
                          style={{
                            backgroundColor: colors.bg,
                            borderColor: isMatched ? '#ffffff' : colors.stroke,
                            color: colors.text,
                            boxShadow: isMatched ? `0 0 12px ${colors.stroke}` : undefined,
                          }}
                          className={`px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                            isMatched ? 'scale-105 font-bold ring-1 ring-white/60' : 'opacity-85 hover:opacity-100 hover:scale-102'
                          }`}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: colors.stroke }} 
                          />
                          {feat}
                        </button>
                      );
                    })}
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
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-200 font-medium flex items-center gap-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
                  NASA/IPAC Caltech Level 2 Observation Cutouts ({cutouts.length} retrieved planes):
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono">
                  TAP: irsa.ipac.caltech.edu
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {cutouts.map((co, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/30 p-2 rounded-md text-[11px] flex flex-col justify-between space-y-1 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-300 font-mono text-[10px]">{co.bandpass}</span>
                      <span className="text-[9px] text-zinc-400 font-mono">MJD {parseFloat(co.time_mjd).toFixed(2)}</span>
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
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="space-y-1.5 text-xs">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/40 text-zinc-200 hover:text-white border border-white/10 rounded-md text-[11px] font-medium transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  >
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                    Open in WiseView
                  </a>
                  <a
                    href={`https://archive.stsci.edu/missions-and-data/gaia`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/40 text-zinc-200 hover:text-white border border-white/10 rounded-md text-[11px] font-medium transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  >
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                    Inspect Gaia DR3 Catalog
                  </a>
                </div>
              </div>

              {/* Side-by-side snapshot preview */}
              {(() => {
                const isBenchmark = ['barnards-star', 'wise-0855', 'epsilon-indi-b', 'rw-aurigae', 'r-draconis'].includes(target.id);
                const epoch1Src = isBenchmark 
                  ? `/cutouts/${target.id}_epoch0.jpg` 
                  : (target.archivalComparison?.epoch1_url || `/cutouts/barnards-star_epoch0.jpg`);
                const epoch2Src = isBenchmark 
                  ? `/cutouts/${target.id}_epoch2.jpg` 
                  : (target.archivalComparison?.epoch2_url || `/cutouts/barnards-star_epoch2.jpg`);

                return (
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="relative w-20 h-20 rounded-lg border border-cyan-500/30 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-black">
                        <img
                          src={epoch1Src}
                          alt="AllWISE Early Epoch (2015)"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/cutouts/barnards-star_epoch0.jpg`;
                          }}
                        />
                        <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/75 text-[8px] font-mono text-cyan-300 border border-white/10">2015</div>
                      </div>
                      <span className="text-[10px] text-zinc-300 font-mono block mt-1">AllWISE (Ep 1)</span>
                    </div>
                    <div className="text-center">
                      <div className="relative w-20 h-20 rounded-lg border border-cyan-500/30 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-black">
                        <img
                          src={epoch2Src}
                          alt="NEOWISE Late Epoch (2020)"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/cutouts/barnards-star_epoch2.jpg`;
                          }}
                        />
                        <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/75 text-[8px] font-mono text-amber-300 border border-white/10">2020</div>
                      </div>
                      <span className="text-[10px] text-zinc-300 font-mono block mt-1">NEOWISE (Ep 3)</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
