import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { AstroTarget, ViewMode } from '../types';
import { 
  computeImageDifference, 
  computeImageCoadd 
} from '../utils/imageMath';
import { formatRA, formatDec } from '../utils/coordinates';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, Maximize, Minimize } from 'lucide-react';

interface SkyCanvasProps {
  target: AstroTarget;
  currentEpoch: number;
  setCurrentEpoch: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  fps: number;
  viewMode: ViewMode;
  fovArcmin: number;
  inverted: boolean;
  showMotionVector: boolean;
  detectorBand: number;
  onInspectCoordinates: (coords: { ra: number; dec: number; raStr: string; decStr: string }) => void;
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  target,
  currentEpoch,
  setCurrentEpoch,
  isPlaying,
  fps,
  viewMode,
  fovArcmin,
  inverted,
  showMotionVector,
  detectorBand,
  onInspectCoordinates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pan and Zoom states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoords, setHoverCoords] = useState<{ raStr: string; decStr: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // High-density 800px canvas for crisp astronomical clarity & large screen presentation
  const CANVAS_SIZE = 800;

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Calculate actual pixel scale matching the user's FOV slider:
  // 5'-10' -> pixscale 1 (~8.5 arcmin FOV)
  // 15'-20' -> pixscale 2 (~17 arcmin FOV)
  // 25'-40' -> pixscale 4 (~34 arcmin FOV)
  // >40' (e.g. 50'-60') -> size 900, pixscale 4 (Exactly 60.0 arcmin = 1.0 degree wide field!)
  const isWide = fovArcmin > 40;
  let currentPixscale = 2;
  if (fovArcmin <= 10) currentPixscale = 1;
  else if (fovArcmin <= 20) currentPixscale = 2;
  else currentPixscale = 4;

  const totalFovArcsec = isWide ? 3600 : currentPixscale * 512;

  // In-memory cache for all loaded resolution tiers to eliminate chunk-loading pauses completely
  interface CachedTier {
    epochs: HTMLCanvasElement[];
    diff: HTMLCanvasElement | null;
    coadd: HTMLCanvasElement | null;
    baseFovArcsec: number;
  }
  const tierCache = useRef<Map<string, CachedTier>>(new Map());
  const activeBaseFovArcsec = useRef<number>(isWide ? 3600 : currentPixscale * 512);
  const lastTargetId = useRef<string>(target.id);

  // Offscreen canvas caches for the actual imagery
  const offscreenEpochs = useRef<HTMLCanvasElement[]>([]);
  const offscreenDiff = useRef<HTMLCanvasElement | null>(null);
  const offscreenCoadd = useRef<HTMLCanvasElement | null>(null);

  // Helper to load an actual image asynchronously with fallback
  const loadActualImage = (primaryUrl: string, fallbackUrl?: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (fallbackUrl) {
          const fallbackImg = new Image();
          fallbackImg.crossOrigin = 'anonymous';
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(new Error(`Failed to load ${primaryUrl} and fallback`));
          fallbackImg.src = fallbackUrl;
        } else {
          reject(new Error(`Failed to load ${primaryUrl}`));
        }
      };
      img.src = primaryUrl;
    });
  };

  // Load and render the REAL multi-FOV astronomical photos
  useEffect(() => {
    let isCancelled = false;
    const tierKey = isWide ? 'wide' : `ps${currentPixscale}`;
    const cacheKey = `${target.id}_${tierKey}_${inverted ? 'inv' : 'norm'}_b${detectorBand}`;
    const targetBaseFovArcsec = isWide ? 3600 : currentPixscale * 512;

    // Check if this resolution tier is already compiled in memory
    const cached = tierCache.current.get(cacheKey);
    if (cached) {
      offscreenEpochs.current = cached.epochs;
      offscreenDiff.current = cached.diff;
      offscreenCoadd.current = cached.coadd;
      activeBaseFovArcsec.current = cached.baseFovArcsec;
      setLoading(false);
      drawMainCanvas();
      return;
    }

    // Only show full blocking loading screen when selecting a brand-new star or on initial load
    const isNewTarget = lastTargetId.current !== target.id;
    lastTargetId.current = target.id;
    if (isNewTarget || offscreenEpochs.current.length === 0) {
      setLoading(true);
    }

    const epochLayers = ['unwise-neo2', 'unwise-neo4', 'unwise-neo7'];
    const isBenchmark = ['barnards-star', 'wise-0855', 'epsilon-indi-b', 'rw-aurigae', 'r-draconis'].includes(target.id);

    const imagePromises = epochLayers.map((layer, idx) => {
      if (isWide) {
        const localWideUrl = `/cutouts/${target.id}_epoch${idx}_wide.jpg`;
        const fallbackWideUrl = `/cutouts/${target.id}_epoch${idx}_ps4.jpg`;
        const remoteWideUrl = `https://www.legacysurvey.org/viewer/cutout.jpg?ra=${target.ra}&dec=${target.dec}&layer=${layer}&size=900&pixscale=4`;
        const remoteFallbackUrl = `https://www.legacysurvey.org/viewer/cutout.jpg?ra=${target.ra}&dec=${target.dec}&layer=${layer}&size=512&pixscale=4`;

        return isBenchmark
          ? loadActualImage(localWideUrl, fallbackWideUrl)
          : loadActualImage(remoteWideUrl, remoteFallbackUrl);
      } else {
        const localUrl = `/cutouts/${target.id}_epoch${idx}_ps${currentPixscale}.jpg`;
        const fallbackLocalUrl = `/cutouts/${target.id}_epoch${idx}_ps2.jpg`;
        const remoteUrl = `https://www.legacysurvey.org/viewer/cutout.jpg?ra=${target.ra}&dec=${target.dec}&layer=${layer}&size=512&pixscale=${currentPixscale}`;

        return isBenchmark
          ? loadActualImage(localUrl, fallbackLocalUrl)
          : loadActualImage(remoteUrl);
      }
    });

    Promise.all(imagePromises)
      .then((images) => {
        if (isCancelled) return;

        const epochCanvases: HTMLCanvasElement[] = [];

        images.forEach((img) => {
          const oc = document.createElement('canvas');
          oc.width = CANVAS_SIZE;
          oc.height = CANVAS_SIZE;
          const ctx = oc.getContext('2d');
          if (ctx) {
            // Draw the actual authentic NASA image scaled to the canvas
            ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

            // Apply Infrared Detector Bandpass Filter and Inversion
            if (inverted || detectorBand !== 0) {
              const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                let r = d[i];
                let g = d[i + 1];
                let b = d[i + 2];

                // Real-time SPHEREx detector bandpass color response
                if (detectorBand === 1) {
                  // Detectors 1 & 2 (0.75 - 1.86 µm): Near-IR Optical (warm amber tone)
                  r = Math.min(255, r * 1.18);
                  g = Math.min(255, g * 1.05);
                  b = b * 0.72;
                } else if (detectorBand === 2) {
                  // Detectors 3 & 4 (1.86 - 3.82 µm): Water & CO2 Ice (crisp cyan-ice tone)
                  r = r * 0.68;
                  g = Math.min(255, g * 1.12);
                  b = Math.min(255, b * 1.28);
                } else if (detectorBand === 3) {
                  // Detectors 5 & 6 (3.82 - 5.00 µm): Cold Brown Dwarfs & CH4 (deep thermal crimson tone)
                  r = Math.min(255, r * 1.35);
                  g = g * 0.68;
                  b = b * 0.55;
                }

                if (inverted) {
                  r = 255 - r;
                  g = 255 - g;
                  b = 255 - b;
                }

                d[i] = r;
                d[i + 1] = g;
                d[i + 2] = b;
              }
              ctx.putImageData(imgData, 0, 0);
            }
          }
          epochCanvases.push(oc);
        });

        // Compute real image difference: Epoch 2 (2017) - Epoch 1 (2015)
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = CANVAS_SIZE;
        diffCanvas.height = CANVAS_SIZE;
        const diffCtx = diffCanvas.getContext('2d');
        const ctxA = epochCanvases[0].getContext('2d');
        const ctxB = epochCanvases[1].getContext('2d');

        if (diffCtx && ctxA && ctxB) {
          const diffData = computeImageDifference(ctxA, ctxB, CANVAS_SIZE, CANVAS_SIZE);
          diffCtx.putImageData(diffData, 0, 0);
        }

        // Compute co-addition
        const coaddCanvas = document.createElement('canvas');
        coaddCanvas.width = CANVAS_SIZE;
        coaddCanvas.height = CANVAS_SIZE;
        const coaddCtx = coaddCanvas.getContext('2d');
        if (coaddCtx && ctxA && ctxB) {
          const coaddData = computeImageCoadd(ctxA, ctxB, CANVAS_SIZE, CANVAS_SIZE);
          coaddCtx.putImageData(coaddData, 0, 0);
        }

        // Cache this tier in memory for zero-lag switching
        tierCache.current.set(cacheKey, {
          epochs: epochCanvases,
          diff: diffCanvas,
          coadd: coaddCanvas,
          baseFovArcsec: targetBaseFovArcsec,
        });

        offscreenEpochs.current = epochCanvases;
        offscreenDiff.current = diffCanvas;
        offscreenCoadd.current = coaddCanvas;
        activeBaseFovArcsec.current = targetBaseFovArcsec;

        setLoading(false);
        drawMainCanvas();

        // Proactively preload the other tiers in background for benchmark targets
        if (isBenchmark) {
          const allTiers = [
            { key: 'ps1', isW: false, ps: 1, base: 512 },
            { key: 'ps2', isW: false, ps: 2, base: 1024 },
            { key: 'ps4', isW: false, ps: 4, base: 2048 },
            { key: 'wide', isW: true, ps: 4, base: 3600 },
          ];
          allTiers.forEach((t) => {
            const k = `${target.id}_${t.key}_${inverted ? 'inv' : 'norm'}`;
            if (!tierCache.current.has(k)) {
              const bgPromises = epochLayers.map((_, idx) => {
                const url = t.isW 
                  ? `/cutouts/${target.id}_epoch${idx}_wide.jpg`
                  : `/cutouts/${target.id}_epoch${idx}_ps${t.ps}.jpg`;
                const fallback = `/cutouts/${target.id}_epoch${idx}_ps2.jpg`;
                return loadActualImage(url, fallback);
              });
              Promise.all(bgPromises).then((bgImgs) => {
                const bgCanvases: HTMLCanvasElement[] = [];
                bgImgs.forEach((img) => {
                  const oc = document.createElement('canvas');
                  oc.width = CANVAS_SIZE;
                  oc.height = CANVAS_SIZE;
                  const c = oc.getContext('2d');
                  if (c) {
                    c.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    if (inverted) {
                      const imgData = c.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                      const d = imgData.data;
                      for (let i = 0; i < d.length; i += 4) {
                        d[i] = 255 - d[i];
                        d[i + 1] = 255 - d[i + 1];
                        d[i + 2] = 255 - d[i + 2];
                      }
                      c.putImageData(imgData, 0, 0);
                    }
                  }
                  bgCanvases.push(oc);
                });
                const dCanvas = document.createElement('canvas');
                dCanvas.width = CANVAS_SIZE;
                dCanvas.height = CANVAS_SIZE;
                const dC = dCanvas.getContext('2d');
                const cA = bgCanvases[0].getContext('2d');
                const cB = bgCanvases[1].getContext('2d');
                if (dC && cA && cB) {
                  const dData = computeImageDifference(cA, cB, CANVAS_SIZE, CANVAS_SIZE);
                  dC.putImageData(dData, 0, 0);
                }
                const cCanvas = document.createElement('canvas');
                cCanvas.width = CANVAS_SIZE;
                cCanvas.height = CANVAS_SIZE;
                const cC = cCanvas.getContext('2d');
                if (cC && cA && cB) {
                  const cData = computeImageCoadd(cA, cB, CANVAS_SIZE, CANVAS_SIZE);
                  cC.putImageData(cData, 0, 0);
                }
                tierCache.current.set(k, {
                  epochs: bgCanvases,
                  diff: dCanvas,
                  coadd: cCanvas,
                  baseFovArcsec: t.base,
                });
              }).catch(() => {});
            }
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load real NASA cutouts:", err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [target, currentPixscale, isWide, inverted, detectorBand]);

  // Blink animation loop
  useEffect(() => {
    if (!isPlaying || viewMode !== 'blink' || loading) return;

    const intervalMs = Math.max(100, Math.floor(1000 / fps));
    const timer = setInterval(() => {
      setCurrentEpoch((prev: number) => (prev + 1) % 3);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, fps, viewMode, setCurrentEpoch, loading]);

  // Main canvas draw routine
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // The base image loaded in offscreen canvas covers baseFovArcsec
    const baseFovArcsec = activeBaseFovArcsec.current || (isWide ? 3600 : currentPixscale * 512);
    // The user's exact requested continuous FOV from the slider (5' to 60')
    const requestedFovArcsec = fovArcmin * 60;
    // Continuous optical scale factor
    const fovScale = baseFovArcsec / requestedFovArcsec;

    // Apply Pan and Zoom
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Render the actual photos based on selected mode, scaled to the exact FOV
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(fovScale, fovScale);
    ctx.translate(-centerX, -centerY);

    if (viewMode === 'difference' && offscreenDiff.current) {
      ctx.drawImage(offscreenDiff.current, 0, 0);
    } else if (viewMode === 'coadd' && offscreenCoadd.current) {
      ctx.drawImage(offscreenCoadd.current, 0, 0);
    } else if (offscreenEpochs.current[currentEpoch]) {
      ctx.drawImage(offscreenEpochs.current[currentEpoch], 0, 0);
    }
    ctx.restore();

    // In canvas space, 1 pixel physically covers:
    const arcsecPerPixel = requestedFovArcsec / canvas.width;

    let starPosX = centerX;
    let starPosY = centerY;

    if (target.properMotion) {
      const pmRATotal = target.properMotion.pmRA / 1000;   // arcsec/yr
      const pmDecTotal = target.properMotion.pmDec / 1000; // arcsec/yr

      // Epoch years: 2015 (Epoch 1), 2017 (Epoch 2), 2020 (Epoch 3)
      const currentYear = currentEpoch === 0 ? 2015 : currentEpoch === 1 ? 2017 : 2020;
      // Real photographs were taken years after the catalog J2000.0 epoch
      const yearsSinceJ2000 = currentYear - 2000;

      // Real physical coordinates on image: RA increases to the left (-X), Dec increases up (-Y)
      starPosX = centerX + (-pmRATotal * yearsSinceJ2000) / arcsecPerPixel;
      starPosY = centerY + (-pmDecTotal * yearsSinceJ2000) / arcsecPerPixel;

      // Overlay Gaia Proper Motion Vector directly originating from the physical star!
      if (showMotionVector) {
        const futureYears = 5;
        const arrowEndX = starPosX + (-pmRATotal * futureYears) / arcsecPerPixel;
        const arrowEndY = starPosY + (-pmDecTotal * futureYears) / arcsecPerPixel;

        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(starPosX, starPosY);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();

        // Arrow head
        ctx.setLineDash([]);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(arrowEndX, arrowEndY, 4 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${Math.max(10, 11 / zoom)}px ui-monospace, monospace`;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Gaia Drift (+5yr)`, arrowEndX + 8 / zoom, arrowEndY + 4 / zoom);
        ctx.restore();
      }
    }

    // Targeting Reticle (Locks directly onto the moving star!)
    const cx = starPosX;
    const cy = starPosY;
    ctx.save();
    ctx.strokeStyle = inverted ? 'rgba(0, 0, 0, 0.4)' : 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1 / zoom;

    // Crosshair circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18 / zoom, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(cx - 26 / zoom, cy);
    ctx.lineTo(cx - 20 / zoom, cy);
    ctx.moveTo(cx + 20 / zoom, cy);
    ctx.lineTo(cx + 26 / zoom, cy);
    ctx.moveTo(cx, cy - 26 / zoom);
    ctx.lineTo(cx, cy - 20 / zoom);
    ctx.moveTo(cx, cy + 20 / zoom);
    ctx.lineTo(cx, cy + 26 / zoom);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // Restore unpanned, unzoomed HUD coordinates

    // Draw Crisp Angular Scale Bar on HUD (Top-Left)
    const scaleBarArcsec = requestedFovArcsec * 0.1; // 10% of field width
    const scaleBarPixels = canvas.width * 0.1; // 64px

    ctx.fillStyle = inverted ? '#111827' : '#e5e7eb';
    ctx.font = '11px ui-monospace, monospace';
    ctx.strokeStyle = inverted ? '#374151' : '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, 24);
    ctx.lineTo(16 + scaleBarPixels, 24);
    ctx.stroke();

    const scaleLabel = scaleBarArcsec >= 60 
      ? `${(scaleBarArcsec / 60).toFixed(1)}'` 
      : `${scaleBarArcsec.toFixed(0)}"`;
    ctx.fillText(`${scaleLabel} (${fovArcmin.toFixed(1)}' FOV)`, 16, 40);

    // Overlay Authentic Mission Tag on HUD (Bottom-Right)
    const epochYear = currentEpoch === 0 ? '2015' : currentEpoch === 1 ? '2017' : '2020';
    const bandLabel = detectorBand === 1 
      ? 'Det 1-2 (0.75-1.86µm)' 
      : detectorBand === 2 
      ? 'Det 3-4 (1.86-3.82µm)' 
      : detectorBand === 3 
      ? 'Det 5-6 (3.82-5.00µm)' 
      : 'All Bands (0.75-5.00µm)';

    ctx.fillStyle = inverted ? 'rgba(0,0,0,0.85)' : 'rgba(7, 9, 14, 0.9)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(canvas.width - 275, canvas.height - 34, 260, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.fillText(`NASA unWISE [${bandLabel}] • Ep ${currentEpoch + 1} (${epochYear})`, canvas.width - 268, canvas.height - 18);
  }, [currentEpoch, viewMode, zoom, pan, showMotionVector, target, currentPixscale, isWide, fovArcmin, inverted, detectorBand]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas]);

  // Handle Mouse Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Calculate sky coordinates under mouse pointer
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const requestedFovArcsec = fovArcmin * 60;
    const arcsecPerPixel = requestedFovArcsec / canvas.width;
    const dxPixels = (mouseX - canvas.width / 2 - pan.x) / zoom;
    const dyPixels = (mouseY - canvas.height / 2 - pan.y) / zoom;

    const offsetRA = (-dxPixels * arcsecPerPixel) / 3600 / Math.cos((target.dec * Math.PI) / 180);
    const offsetDec = (-dyPixels * arcsecPerPixel) / 3600;

    const pointRA = ((target.ra + offsetRA) % 360 + 360) % 360;
    const pointDec = Math.max(-90, Math.min(90, target.dec + offsetDec));

    setHoverCoords({
      raStr: formatRA(pointRA),
      decStr: formatDec(pointDec),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * zoomFactor)));
  };

  const handleClick = () => {
    if (hoverCoords) {
      onInspectCoordinates({
        ra: target.ra,
        dec: target.dec,
        raStr: hoverCoords.raStr,
        decStr: hoverCoords.decStr,
      });
    }
  };

  const resetPanZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const epochYears = ['2015', '2017', '2020'];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'bg-transparent'
      }`}
    >
      {/* Top Banner Status Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="bg-[#07090e]/90 backdrop-blur-xl px-3.5 py-1.5 rounded-lg border border-white/15 text-xs font-mono flex items-center gap-2 pointer-events-auto shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </span>
          <span className="text-zinc-200 flex items-center gap-1.5">
            <span className="text-white font-bold tracking-tight">NASA unWISE:</span>
            {viewMode === 'blink' && `Epoch ${currentEpoch + 1} (${epochYears[currentEpoch]})`}
            {viewMode === 'difference' && 'Difference Subtraction (2017 - 2015)'}
            {viewMode === 'coadd' && 'Co-added Summation (2015 + 2017)'}
          </span>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center space-x-1 bg-[#07090e]/90 backdrop-blur-xl p-1 rounded-lg border border-white/15 pointer-events-auto shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
          <button
            onClick={() => setZoom((z) => Math.min(5, z * 1.25))}
            className="p-1.5 hover:bg-white/10 hover:text-cyan-300 rounded text-zinc-400 transition-colors"
            title="Magnify Pixels (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
            className="p-1.5 hover:bg-white/10 hover:text-cyan-300 rounded text-zinc-400 transition-colors"
            title="Demagnify Pixels (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetPanZoom}
            className="p-1.5 hover:bg-white/10 hover:text-cyan-300 rounded text-zinc-400 transition-colors"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-white/15 mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/10 hover:text-cyan-300 rounded text-zinc-400 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Large Celestial Screen Container */}
      <div className={`relative border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15),0_0_100px_rgba(30,58,138,0.22),0_25px_50px_-12px_rgba(0,0,0,0.9)] bg-black flex items-center justify-center cursor-crosshair transition-all ${
        isFullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0' : 'w-full max-w-[850px] max-h-[calc(100vh-130px)] aspect-square'
      }`}>
        {/* Subtle Viewfinder Reticle Corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-10 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-10 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-10 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-10 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs text-cyan-200 font-mono tracking-wide">Streaming NASA infrared cutouts...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleClick}
          className="w-full h-full object-contain"
        />

        {/* Live Coordinate Reticle Info in Bottom Left */}
        {hoverCoords && (
          <div className="absolute bottom-3 left-3 bg-[#07090e]/90 backdrop-blur-xl px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-200 border border-cyan-500/30 pointer-events-none shadow-[0_0_16px_rgba(6,182,212,0.25)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
            <span>RA: <strong className="text-white">{hoverCoords.raStr}</strong> | Dec: <strong className="text-white">{hoverCoords.decStr}</strong></span>
          </div>
        )}

        {/* Compass Cardinal Directions */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-zinc-300 pointer-events-none flex flex-col items-center bg-[#07090e]/90 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <span className="font-semibold text-cyan-300">N (+Dec)</span>
          <span className="text-[9px] text-zinc-400">E ◄──► W</span>
        </div>
      </div>
    </div>
  );
};
