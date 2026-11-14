import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { AstroTarget } from '../types';
import { Award, X, Copy, Check, Download } from 'lucide-react';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: AstroTarget;
  currentRA: string;
  currentDec: string;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  isOpen,
  onClose,
  target,
  currentRA,
  currentDec,
}) => {
  const [candidateType, setCandidateType] = useState('Brown Dwarf Candidate');
  const [motionArcsec, setMotionArcsec] = useState('4.2');
  const [notes, setNotes] = useState('Observed distinct dipole residual in Epoch 2 - Epoch 1 difference imaging with high-proper-motion signature.');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reportData = {
    submissionTitle: `SPHEREx Time-Domain Candidate: ${target.name}`,
    mission: "NASA SPHEREx 102-Band Near-Infrared Survey",
    coordinates: {
      ra: currentRA,
      dec: currentDec,
    },
    candidateClassification: candidateType,
    estimatedShiftArcsec: motionArcsec,
    observedEpochs: ["Survey 1 (May 2025)", "Survey 2 (Nov 2025)"],
    methodology: "Blink Comparator & Difference Subtraction (E2 - E1)",
    observerNotes: notes,
    timestamp: new Date().toISOString(),
    event: "NASA Space Apps Challenge 2026",
  };

  const handleLogCandidate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    setSubmitted(true);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spherex-candidate-${target.id}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080a10] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.18),0_25px_50px_-12px_rgba(0,0,0,0.9)] relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Award className="w-5 h-5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Log Discovery Candidate</h2>
            <p className="text-[11px] font-mono text-cyan-300/80">Citizen Science & NASA Submission Export</p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl animate-bounce">🎉</div>
            <h3 className="text-base font-bold text-white">Discovery Candidate Logged!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Your candidate at <span className="font-mono text-cyan-300 font-semibold">{currentRA}, {currentDec}</span> has been formatted for your NASA Space Apps Challenge report.
            </p>
            <div className="flex justify-center gap-2 pt-3">
              <button
                onClick={handleCopyReport}
                className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] hover:border-cyan-500/40 text-zinc-200 rounded-lg text-xs font-medium border border-white/15 flex items-center gap-1.5 transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy JSON
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(59,130,246,0.4)] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Target Coordinates</label>
              <div className="font-mono bg-black/60 p-2.5 rounded-lg border border-white/10 text-cyan-200 flex justify-between shadow-inner">
                <span>RA: <strong className="text-white">{currentRA}</strong></span>
                <span>Dec: <strong className="text-white">{currentDec}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Classification</label>
                <select
                  value={candidateType}
                  onChange={(e) => setCandidateType(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                >
                  <option>Fast-Moving Asteroid</option>
                  <option>Near-Earth Comet</option>
                  <option>Cold Brown Dwarf (Y-Dwarf)</option>
                  <option>High Proper Motion Star</option>
                  <option>Pulsating Variable Star</option>
                  <option>Supernova Transient</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Estimated Shift (arcsec)</label>
                <input
                  type="text"
                  value={motionArcsec}
                  onChange={(e) => setMotionArcsec(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase tracking-wider">Observer Notes / Evidence</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogCandidate}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.35)] text-xs transition-all"
              >
                Log Candidate & Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
