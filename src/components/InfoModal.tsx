import React from 'react';
import { X, Telescope, Sparkles, Layers, Award } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E1118] border border-white/10 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Telescope className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">How SPHEREx SkyBlink Works</h2>
            <p className="text-[11px] font-mono text-zinc-400">2026 NASA Space Apps Challenge User Guide</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
          <section className="bg-black/40 p-3.5 rounded-lg border border-white/[0.08] space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              1. The Science: Why Compare Sky Photos Over Time?
            </h3>
            <p className="text-zinc-300">
              NASA's <strong>SPHEREx</strong> space observatory surveys the entire sky every 6 months across <strong>102 near-infrared bands</strong> (0.75 to 5.0 µm). By comparing photos taken across observation epochs, we detect two major astrophysical phenomena:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-[11px]">
              <li>
                <strong className="text-zinc-200">Proper Motion Objects ("Jumpers"):</strong> Nearby high-velocity stars (like <em>Barnard's Star</em>), cold brown dwarfs (like <em>WISE 0855</em>), and solar system asteroids physically shift across the background star field.
              </li>
              <li>
                <strong className="text-zinc-200">Photometric Variables ("Blinkers"):</strong> Pulsating red giants (like <em>R Draconis</em>) and dust-occulted young stars (like <em>RW Aurigae</em>) stay in one spot but flare and dim by hundreds of times.
              </li>
            </ul>
          </section>

          <section className="bg-black/40 p-3.5 rounded-lg border border-white/[0.08] space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              2. Core Platform Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-black/50 rounded-md border border-white/[0.06]">
                <span className="font-medium text-white block mb-0.5">Blink Comparator:</span>
                Flickers between multi-year NASA epochs at custom FPS playback speeds with smooth keyboard and mouse scrub controls.
              </div>
              <div className="p-2.5 bg-black/50 rounded-md border border-white/[0.06]">
                <span className="font-medium text-white block mb-0.5">Difference Imaging:</span>
                Calculates (Epoch 2 - Epoch 1) pixel subtraction, cancelling static background stars and exposing moving dipoles.
              </div>
              <div className="p-2.5 bg-black/50 rounded-md border border-white/[0.06]">
                <span className="font-medium text-white block mb-0.5">Continuous Optical FOV:</span>
                Smooth real-time optical zoom from 5 arcminutes (stellar cores) up to 60 arcminutes (1-degree wide fields).
              </div>
              <div className="p-2.5 bg-black/50 rounded-md border border-white/[0.06]">
                <span className="font-medium text-white block mb-0.5">102-Band SED & IRSA:</span>
                Interactive infrared spectral curves from 0.75 to 5.0 µm, identifying H2O ice (3.0µm), CO2 ice (4.26µm), and CH4 (1.66µm).
              </div>
            </div>
          </section>

          <section className="bg-black/40 p-3 rounded-lg border border-white/[0.08] space-y-1">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              3. NASA Challenge Benchmark Targets
            </h3>
            <p className="text-[11px] text-zinc-400">
              Select any of the 5 official targets in the left sidebar to immediately verify proper motion or photometric variability. You can also type arbitrary RA and Dec coordinates or share deep links via the <strong>Share</strong> button.
            </p>
          </section>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
