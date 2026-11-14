import React, { useState } from 'react';
import { Telescope, Share2, HelpCircle, Check, Award } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenDiscovery: () => void;
  currentRA: string;
  currentDec: string;
  currentFOV: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenDiscovery,
  currentRA,
  currentDec,
  currentFOV,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('ra', currentRA);
    url.searchParams.set('dec', currentDec);
    url.searchParams.set('fov', currentFOV.toString());
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="relative h-14 border-b border-white/[0.1] bg-[#07090e]/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Top Hairline Neon Laser Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

      {/* Brand & Mission Title */}
      <div className="flex items-center space-x-3">
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <Telescope className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
        </div>
        <div className="flex items-center space-x-2.5">
          <h1 className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
            <span className="tracking-tight text-white font-bold">SPHEREx</span>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-zinc-300 bg-clip-text text-transparent font-medium">SkyBlink</span>
          </h1>

          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase shadow-[0_0_10px_rgba(59,130,246,0.15)]">
            NASA Space Apps 2026
          </span>

          {/* Live Telemetry Pulse Beacon */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-[10px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            </span>
            <span className="tracking-wide">ACTIVE TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenHelp}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 rounded-md border border-white/10 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center gap-1.5"
          title="User Guide & Keyboard Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/30 rounded-md border border-white/10 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center gap-1.5"
          title="Copy shareable link with current coordinates"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenDiscovery}
          className="relative px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 rounded-md border border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] transition-all flex items-center gap-1.5"
        >
          <Award className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
          <span>Report Discovery</span>
        </button>
      </div>
    </header>
  );
};
