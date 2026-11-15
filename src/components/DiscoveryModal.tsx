import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { AstroTarget } from '../types';
import { Award, X, Copy, Check, Download, FileText, Table, Code } from 'lucide-react';

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
  const [candidateType, setCandidateType] = useState('Cold Brown Dwarf (Y-Dwarf)');
  const [motionArcsec, setMotionArcsec] = useState('4.2');
  const [notes, setNotes] = useState('Observed distinct dipole residual in Epoch 2 - Epoch 1 difference imaging with high-proper-motion signature.');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const timestamp = new Date().toISOString();

  const reportData = {
    submissionTitle: `SPHEREx Time-Domain Candidate: ${target.name}`,
    mission: "NASA SPHEREx 102-Band Near-Infrared Survey",
    coordinates: {
      ra: currentRA,
      dec: currentDec,
    },
    candidateClassification: candidateType,
    estimatedShiftArcsec: motionArcsec,
    observedEpochs: ["Survey 1 (2015)", "Survey 2 (2020)"],
    methodology: "Blink Comparator & Difference Subtraction (E2 - E1)",
    spectralRange: "102 Channels (0.75 - 5.00 µm)",
    observerNotes: notes,
    timestamp: timestamp,
    event: "NASA Space Apps Challenge 2026",
  };

  const generateTxtReport = () => {
    return [
      "========================================================================",
      "NASA SPHEREx SKYBLINK OBSERVATION LOG & CANDIDATE REPORT",
      "2026 NASA Space Apps Challenge: Planet X and SPHEREx",
      "========================================================================",
      "",
      `Candidate Title:         ${reportData.submissionTitle}`,
      `Classification:          ${candidateType}`,
      `Celestial Coordinates:`,
      `  - Right Ascension (J2000): ${currentRA}`,
      `  - Declination (J2000):     ${currentDec}`,
      "",
      `[TIME-DOMAIN DETECTION]`,
      `Observed Angular Shift:  ${motionArcsec} arcseconds`,
      `Survey Epochs Compared:  Survey 1 (2015) vs Survey 2 (2020)`,
      `Detection Methodology:   Blink Comparator & Difference Subtraction (E2 - E1)`,
      `Spectroscopic Coverage:  SPHEREx 102-Band Near-IR (0.75 - 5.00 µm)`,
      "",
      `[OBSERVER EVIDENCE & NOTES]`,
      notes,
      "",
      `[METADATA]`,
      `Date & Time Logged:      ${timestamp}`,
      `Discovery Instrument:    SPHEREx SkyBlink Time-Domain Platform`,
      "========================================================================",
    ].join("\n");
  };

  const generateCsvReport = () => {
    const headers = [
      "Target_Name",
      "Classification",
      "RA_J2000",
      "Dec_J2000",
      "Shift_Arcsec",
      "Methodology",
      "Epoch_1",
      "Epoch_2",
      "Observer_Notes",
      "Timestamp",
    ];
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const row = [
      escapeCsv(target.name),
      escapeCsv(candidateType),
      escapeCsv(currentRA),
      escapeCsv(currentDec),
      escapeCsv(motionArcsec),
      escapeCsv("Blink Comparator & Difference Subtraction"),
      escapeCsv("2015"),
      escapeCsv("2020"),
      escapeCsv(notes),
      escapeCsv(timestamp),
    ];
    return `${headers.join(",")}\n${row.join(",")}\n`;
  };

  const handleLogCandidate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    setSubmitted(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyTxt = () => {
    navigator.clipboard.writeText(generateTxtReport());
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generateTxtReport()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spherex-observation-log-${target.id}-${Date.now()}.txt`;
    a.click();
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([generateCsvReport()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spherex-candidate-table-${target.id}-${Date.now()}.csv`;
    a.click();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spherex-candidate-api-${target.id}-${Date.now()}.json`;
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

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Award className="w-5 h-5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Log Discovery Candidate</h2>
            <p className="text-[11px] font-mono text-cyan-300/80">Astronomical Observation Logging & Submission</p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="text-4xl animate-bounce">🎉</div>
            <div>
              <h3 className="text-base font-bold text-white">Discovery Candidate Logged!</h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed mt-1">
                Your candidate at <span className="font-mono text-cyan-300 font-semibold">{currentRA}, {currentDec}</span> is ready for export in professional scientific formats:
              </p>
            </div>

            {/* Multi-Format Export Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              {/* Option 1: Formatted Text Log (.txt) */}
              <button
                onClick={handleDownloadTxt}
                className="p-3 rounded-xl bg-gradient-to-b from-cyan-950/40 to-black/60 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.25)] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <FileText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">.TXT</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Observation Log</span>
                  <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">Human-readable report for research & papers.</span>
                </div>
                <div className="mt-2 text-[10px] font-medium text-cyan-300 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download TXT
                </div>
              </button>

              {/* Option 2: Tabular Spreadsheet (.csv) */}
              <button
                onClick={handleDownloadCsv}
                className="p-3 rounded-xl bg-gradient-to-b from-blue-950/40 to-black/60 border border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Table className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30">.CSV</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Spreadsheet Table</span>
                  <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">Opens in Excel, Sheets & Astropy/Python.</span>
                </div>
                <div className="mt-2 text-[10px] font-medium text-blue-300 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download CSV
                </div>
              </button>

              {/* Option 3: Developer JSON (.json) */}
              <button
                onClick={handleDownloadJson}
                className="p-3 rounded-xl bg-gradient-to-b from-purple-950/40 to-black/60 border border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_16px_rgba(192,132,252,0.25)] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Code className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30">.JSON</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">API Schema</span>
                  <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">Standard machine format for web endpoints.</span>
                </div>
                <div className="mt-2 text-[10px] font-medium text-purple-300 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download JSON
                </div>
              </button>
            </div>

            {/* Quick Copy Action Bar */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={handleCopyTxt}
                className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] hover:border-cyan-500/40 text-zinc-200 rounded-lg text-xs font-medium border border-white/15 flex items-center gap-1.5 transition-all shadow-sm"
              >
                {copiedTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                {copiedTxt ? "Copied Log!" : "Copy Report Text"}
              </button>

              <button
                onClick={handleCopyJson}
                className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] hover:border-purple-500/40 text-zinc-200 rounded-lg text-xs font-medium border border-white/15 flex items-center gap-1.5 transition-all shadow-sm"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                {copiedJson ? "Copied JSON!" : "Copy JSON Data"}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all ml-1"
              >
                Done
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
                  className="w-full bg-black/60 border border-white/15 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 cursor-pointer"
                >
                  <option>Cold Brown Dwarf (Y-Dwarf)</option>
                  <option>Planet X / Outer Body Candidate</option>
                  <option>High Proper Motion Star</option>
                  <option>Fast-Moving Asteroid</option>
                  <option>Near-Earth Comet</option>
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
