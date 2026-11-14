import React, { useState, useEffect } from 'react';
import type { AstroTarget, ViewMode } from './types';
import { OFFICIAL_TARGETS } from './data/targets';
import { parseCoordinates } from './utils/coordinates';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { SkyCanvas } from './components/SkyCanvas';
import { PlayerBar } from './components/PlayerBar';
import { SpectrumViewer } from './components/SpectrumViewer';
import { DiscoveryModal } from './components/DiscoveryModal';
import { InfoModal } from './components/InfoModal';

export const App: React.FC = () => {
  // Current Target State
  const [currentTarget, setCurrentTarget] = useState<AstroTarget>(OFFICIAL_TARGETS[0]); // Barnard's Star by default
  const [isCustomCoords, setIsCustomCoords] = useState(false);

  // Coordinate Inputs
  const [raInput, setRaInput] = useState(OFFICIAL_TARGETS[0].raString);
  const [decInput, setDecInput] = useState(OFFICIAL_TARGETS[0].decString);

  // Viewing Options
  const [fovArcmin, setFovArcmin] = useState(OFFICIAL_TARGETS[0].recommendedFOV);
  const [viewMode, setViewMode] = useState<ViewMode>('blink');
  const [inverted, setInverted] = useState(false);
  const [showMotionVector, setShowMotionVector] = useState(true);
  const [detectorBand, setDetectorBand] = useState(0);

  // Playback State
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(2.5);

  // Inspected pixel info
  const [inspectedCoords, setInspectedCoords] = useState<{
    ra: number;
    dec: number;
    raStr: string;
    decStr: string;
  } | null>(null);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  // Handle URL Query Params on mount (Deep linking requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRA = params.get('ra');
    const urlDec = params.get('dec');
    const urlFov = params.get('fov');
    const urlTarget = params.get('target');

    if (urlTarget) {
      const match = OFFICIAL_TARGETS.find((t) => t.id === urlTarget);
      if (match) {
        handleSelectTarget(match);
        return;
      }
    }

    if (urlRA && urlDec) {
      const parsed = parseCoordinates(urlRA, urlDec);
      if (parsed) {
        setRaInput(parsed.raString);
        setDecInput(parsed.decString);
        setCurrentTarget({
          id: 'custom-query',
          name: `Sky Patch (${parsed.raString.split(' ')[0]}, ${parsed.decString.split(' ')[0]})`,
          category: 'proper-motion',
          categoryLabel: 'Custom Coordinate Query',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          description: 'Custom coordinates queried via deep-link parameters.',
          significance: 'Custom sky location loaded from external link.',
          ra: parsed.ra,
          dec: parsed.dec,
          raString: parsed.raString,
          decString: parsed.decString,
          recommendedFOV: urlFov ? Number(urlFov) : 15,
          spectralFeatures: ["Broadband Near-IR Continuum (0.75-5.0µm)"],
          mockSpectrum: OFFICIAL_TARGETS[0].mockSpectrum,
        });
        setIsCustomCoords(true);
        if (urlFov) setFovArcmin(Number(urlFov));
      }
    }
  }, []);

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTarget = (target: AstroTarget) => {
    setCurrentTarget(target);
    setIsCustomCoords(false);
    setRaInput(target.raString);
    setDecInput(target.decString);
    setFovArcmin(target.recommendedFOV);
    setInspectedCoords(null);
  };

  const handleSearchCoordinates = () => {
    const parsed = parseCoordinates(raInput, decInput);
    if (!parsed) {
      alert("Invalid Coordinates! Please enter valid RA (e.g. 08h 55m 10s or 133.79°) and Dec (e.g. -07° 14' 42\" or -7.24°)");
      return;
    }

    // Check if matches an official target
    const match = OFFICIAL_TARGETS.find(
      (t) => Math.abs(t.ra - parsed.ra) < 0.05 && Math.abs(t.dec - parsed.dec) < 0.05
    );

    if (match) {
      handleSelectTarget(match);
      return;
    }

    // Create custom coordinate target
    setCurrentTarget({
      id: `custom-${Date.now()}`,
      name: `Sky Patch (${parsed.raString.split(' ')[0]}, ${parsed.decString.split(' ')[0]})`,
      category: 'proper-motion',
      categoryLabel: 'Custom Observation Patch',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: `User-specified coordinate patch centered at RA ${parsed.raString}, Dec ${parsed.decString}.`,
      significance: 'Custom sky location under inspection for motion and variability.',
      ra: parsed.ra,
      dec: parsed.dec,
      raString: parsed.raString,
      decString: parsed.decString,
      recommendedFOV: fovArcmin,
      spectralFeatures: ["Near-IR Optical Continuum (SPHEREx 0.75-5.00µm)"],
      mockSpectrum: OFFICIAL_TARGETS[0].mockSpectrum,
    });
    setIsCustomCoords(true);
    setInspectedCoords(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#06070a] text-zinc-100 overflow-hidden font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Deep Space Atmospheric Radial Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[350px] bg-blue-600/[0.07] rounded-full blur-[120px] -z-10" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[500px] h-[300px] bg-cyan-500/[0.05] rounded-full blur-[100px] -z-10" />

      {/* 1. Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        currentRA={currentTarget.raString}
        currentDec={currentTarget.decString}
        currentFOV={fovArcmin}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Control Panel */}
        <ControlPanel
          currentTarget={currentTarget}
          onSelectTarget={handleSelectTarget}
          raInput={raInput}
          decInput={decInput}
          setRaInput={setRaInput}
          setDecInput={setDecInput}
          onSearchCoordinates={handleSearchCoordinates}
          isCustomCoords={isCustomCoords}
          fovArcmin={fovArcmin}
          setFovArcmin={setFovArcmin}
          viewMode={viewMode}
          setViewMode={setViewMode}
          inverted={inverted}
          setInverted={setInverted}
          showMotionVector={showMotionVector}
          setShowMotionVector={setShowMotionVector}
          detectorBand={detectorBand}
          setDetectorBand={setDetectorBand}
        />

        {/* Center Canvas & Media Controls */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#06070a]/95 relative">
          {/* 2D Canvas Area */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <SkyCanvas
              target={currentTarget}
              currentEpoch={currentEpoch}
              setCurrentEpoch={setCurrentEpoch}
              isPlaying={isPlaying}
              fps={fps}
              viewMode={viewMode}
              fovArcmin={fovArcmin}
              inverted={inverted}
              showMotionVector={showMotionVector}
              detectorBand={detectorBand}
              onInspectCoordinates={setInspectedCoords}
            />
          </div>

          {/* Player Media Bar */}
          <PlayerBar
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentEpoch={currentEpoch}
            setCurrentEpoch={setCurrentEpoch}
            fps={fps}
            setFps={setFps}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* On-the-fly 102-Band Spectrum Inspector (Bottom Drawer) */}
          <SpectrumViewer
            target={currentTarget}
            inspectedCoords={inspectedCoords}
          />
        </div>
      </div>

      {/* 3. Modals */}
      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        target={currentTarget}
        currentRA={currentTarget.raString}
        currentDec={currentTarget.decString}
      />

      <InfoModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
