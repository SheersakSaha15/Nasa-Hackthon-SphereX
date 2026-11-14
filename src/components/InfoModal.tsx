import React from 'react';
import { X, Telescope, Sparkles, Layers, Award, ArrowUpRight, Sliders, Activity } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080a10] border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.18),0_25px_50px_-12px_rgba(0,0,0,0.9)] relative space-y-4 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Telescope className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">How SPHEREx SkyBlink Works</h2>
            <p className="text-[11px] font-mono text-cyan-300/80">2026 NASA Space Apps Challenge User Guide</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
          {/* Section 1: The Science */}
          <section className="bg-black/50 p-3.5 rounded-xl border border-white/[0.08] space-y-2 shadow-inner">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
              1. The Science: Why Compare Sky Photos Over Time?
            </h3>
            <p className="text-zinc-300">
              NASA's <strong>SPHEREx</strong> space observatory maps the entire celestial sphere every 6 months across <strong>102 near-infrared bands</strong> (0.75 to 5.0 µm). By comparing photos taken across multi-year observation epochs, we detect two major astrophysical phenomena:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-[11px]">
              <li>
                <strong className="text-zinc-200">Proper Motion Objects ("Jumpers"):</strong> High-velocity stars (like <em>Barnard's Star</em>), ultra-cold brown dwarfs (like <em>WISE 0855</em>), and outer solar system bodies (like <em>Planet X candidates</em>) physically drift across the background star field due to real orbital and spatial velocity.
              </li>
              <li>
                <strong className="text-zinc-200">Photometric Variables ("Blinkers"):</strong> Pulsating red giants (like <em>R Draconis</em>) and dust-occulted young stellar objects (like <em>RW Aurigae</em>) stay fixed in space but fluctuate in brightness by hundreds of percent over time.
              </li>
            </ul>
          </section>

          {/* Section 2: What Are the 102 Infrared Bands? */}
          <section className="bg-black/50 p-3.5 rounded-xl border border-white/[0.08] space-y-2.5 shadow-inner">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Sliders className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
              2. What Are SPHEREx's 102 Infrared Bands?
            </h3>
            <p className="text-zinc-300">
              Unlike normal cameras that capture only 3 broad colors (Red, Green, Blue) or Hubble that takes photos in broad filters, <strong>SPHEREx carries 6 focal plane detector arrays</strong> equipped with Linear Variable Filters (LVFs). These divide incoming near-infrared light into <strong>102 distinct narrow color slices</strong> between <strong>0.75 µm and 5.00 µm</strong> (resolving power <em>R ≈ 41–130</em>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06] space-y-1">
                <span className="font-semibold text-amber-300 block">Detectors 1 & 2 (0.75–1.86 µm)</span>
                <span className="text-zinc-400 text-[10px] block leading-tight">
                  Near-IR Optical: Tracks warm stars, stellar parallaxes, and measures baseline stellar proper motion.
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06] space-y-1">
                <span className="font-semibold text-cyan-300 block">Detectors 3 & 4 (1.86–3.82 µm)</span>
                <span className="text-zinc-400 text-[10px] block leading-tight">
                  Ice Absorption: Isolates the critical <strong>H2O ice absorption dip at 3.05 µm</strong> and <strong>CO2 ice at 4.26 µm</strong> on comets and protoplanetary discs.
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06] space-y-1">
                <span className="font-semibold text-purple-300 block">Detectors 5 & 6 (3.82–5.00 µm)</span>
                <span className="text-zinc-400 text-[10px] block leading-tight">
                  Cold Thermal Infrared: Isolates <strong>Methane (CH4)</strong> absorption at 1.66 & 2.3 µm. Where ultra-cold brown dwarfs and Planet X candidates emit their peak flux!
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: What is Gaia & The Gaia Motion Vector? */}
          <section className="bg-black/50 p-3.5 rounded-xl border border-white/[0.08] space-y-2 shadow-inner">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
              3. What is Gaia & The Gaia Motion Vector (+5yr)?
            </h3>
            <p className="text-zinc-300">
              <strong>ESA's Gaia Space Telescope</strong> is the premier astrometric mission in human history, charting ultra-precise 3D positions, distances, and velocities for over 1.8 billion celestial objects.
            </p>
            <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06] space-y-1 text-[11px]">
              <span className="font-semibold text-amber-300 block">The "Gaia Motion Vector (+5yr)" Overlay:</span>
              <p className="text-zinc-400 text-[10px] leading-relaxed">
                When enabled on the left panel, the canvas queries the official <strong>Gaia DR3 astrometric catalog</strong> for the target's measured proper motion (Right Ascension drift <em>pmRA</em> and Declination drift <em>pmDec</em> in milliarcseconds per year). It draws a gold dashed vector originating from the star pointing exactly where Gaia calculates the star will move <strong>5 years into the future</strong>!
              </p>
              <p className="text-cyan-300/90 text-[10px] pt-0.5">
                ✦ <em>Pro Tip:</em> If the star blinks along the exact path of the gold vector, you have confirmed genuine celestial motion and ruled out camera sensor artifacts or cosmic rays!
              </p>
            </div>
          </section>

          {/* Section 4: Core Platform Capabilities */}
          <section className="bg-black/50 p-3.5 rounded-xl border border-white/[0.08] space-y-2 shadow-inner">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
              4. Core Discovery Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06]">
                <span className="font-semibold text-cyan-200 block mb-0.5">Blink Comparator:</span>
                Rapidly alternates between multi-year NASA epochs at customizable FPS speeds. Moving bodies jump while static stars stay still.
              </div>
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06]">
                <span className="font-semibold text-cyan-200 block mb-0.5">Difference Imaging (Subtraction):</span>
                Computes (Epoch 2 - Epoch 1). Static stars subtract to black; moving objects produce distinct bright/dark dipole pairs.
              </div>
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06]">
                <span className="font-semibold text-cyan-200 block mb-0.5">Continuous Optical Zoom:</span>
                Smooth continuous scaling from 5 arcminutes (tight stellar cores) up to 60 arcminutes (1-degree wide fields).
              </div>
              <div className="p-2.5 bg-black/60 rounded-lg border border-white/[0.06]">
                <span className="font-semibold text-cyan-200 block mb-0.5">Citizen Science Logging:</span>
                Click "Report Discovery" to log celestial coordinates, candidate type, and export standardized JSON reports for NASA Space Apps.
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
