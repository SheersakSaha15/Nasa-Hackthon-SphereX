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
    <header className="h-14 border-b border-white/[0.08] bg-[#090A0F]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Mission Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shadow-sm">
          <Telescope className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-center space-x-2.5">
          <h1 className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
            <span>SPHEREx</span>
            <span className="text-zinc-400 font-normal">SkyBlink</span>
          </h1>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-white/[0.04] text-zinc-400 border border-white/10 uppercase">
            NASA Space Apps 2026
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenHelp}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-md border border-white/10 transition-colors flex items-center gap-1.5"
          title="User Guide & Keyboard Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        <button
          onClick={handleShare}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-md border border-white/10 transition-colors flex items-center gap-1.5"
          title="Copy shareable link with current coordinates"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
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
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md border border-blue-400/30 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Award className="w-3.5 h-3.5 text-amber-300" />
          <span>Report Discovery</span>
        </button>
      </div>
    </header>
  );
};
