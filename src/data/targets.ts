import type { AstroTarget, SpectralPoint } from '../types';
import spherexManifest from './spherex_manifest.json';

/**
 * Helper to generate a realistic 102-band SPHEREx infrared spectrum (0.75 - 5.00 microns)
 */
function generateSPHERExSpectrum(
  baseProfile: (wl: number) => number,
  features: { wl: number; width: number; depth: number; name: string }[]
): SpectralPoint[] {
  const points: SpectralPoint[] = [];
  const minWl = 0.75;
  const maxWl = 5.00;
  const numBands = 102;
  const step = (maxWl - minWl) / (numBands - 1);

  for (let i = 0; i < numBands; i++) {
    const wl = parseFloat((minWl + i * step).toFixed(3));
    let flux = baseProfile(wl);

    let matchedFeature: string | undefined = undefined;
    for (const feat of features) {
      const dist = Math.abs(wl - feat.wl);
      if (dist < feat.width) {
        const factor = 1 - (feat.depth * Math.exp(-0.5 * Math.pow(dist / (feat.width / 2.355), 2)));
        flux *= Math.max(0.05, factor);
        if (dist < feat.width * 0.4) {
          matchedFeature = feat.name;
        }
      }
    }

    // Add tiny realistic sensor noise
    const noise = (Math.sin(i * 12.7) * 0.015);
    flux = Math.max(0.02, Math.min(1.0, flux + noise));

    points.push({
      wavelength: wl,
      flux: parseFloat(flux.toFixed(4)),
      featureName: matchedFeature,
    });
  }

  return points;
}

const BASE_TARGETS: AstroTarget[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    category: 'proper-motion',
    categoryLabel: 'High Proper Motion (Red Dwarf)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: "The fastest moving star in the entire sky (~10.37 arcsec/yr). Located just 6 light-years away.",
    significance: "Crucial test for high-speed stellar motion. Across 6-month SPHEREx scans, it shifts ~5.2 arcseconds.",
    ra: 269.4521,
    dec: 4.6934,
    raString: "17h 57m 48.50s",
    decString: "+04° 41' 36.24\"",
    properMotion: {
      pmRA: -798.58,
      pmDec: 10328.12,
      totalArcsecPerYear: 10.37,
    },
    recommendedFOV: 15,
    spectralFeatures: ["TiO Bands (0.85µm)", "H2O Vapor (1.4µm & 1.9µm)", "CO Bandhead (2.3µm)"],
    mockSpectrum: generateSPHERExSpectrum(
      (wl) => Math.exp(-Math.pow(wl - 1.2, 2) / 2.5) * 0.9 + 0.1,
      [
        { wl: 0.85, width: 0.10, depth: 0.30, name: "TiO Bands" },
        { wl: 1.4, width: 0.15, depth: 0.35, name: "H2O Vapor" },
        { wl: 1.9, width: 0.18, depth: 0.40, name: "H2O Vapor" },
        { wl: 2.3, width: 0.12, depth: 0.25, name: "CO Bandhead" },
      ]
    ),
  },
  {
    id: 'wise-0855',
    name: "WISE 0855−0714",
    category: 'brown-dwarf',
    categoryLabel: 'Cold Brown Dwarf (Y-Dwarf)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: "The coldest known brown dwarf (temp ~250 K / -23°C). A sub-stellar gas world moving at 8.1 arcsec/yr.",
    significance: "Invisible to optical eyes; only shines in near/mid-infrared. Features atmospheric water clouds!",
    ra: 133.7951,
    dec: -7.2452,
    raString: "08h 55m 10.83s",
    decString: "-07° 14' 42.53\"",
    properMotion: {
      pmRA: -8132.0,
      pmDec: 565.0,
      totalArcsecPerYear: 8.15,
    },
    recommendedFOV: 15,
    spectralFeatures: ["CH4 Methane (1.66µm)", "H2O Ice Clouds (3.0µm)", "4.5µm Flux Window"],
    mockSpectrum: generateSPHERExSpectrum(
      (wl) => Math.pow(wl / 4.5, 3) * 0.7 + 0.05,
      [
        { wl: 1.66, width: 0.15, depth: 0.75, name: "CH4 Methane" },
        { wl: 3.05, width: 0.35, depth: 0.65, name: "H2O Ice Clouds" },
        { wl: 4.26, width: 0.15, depth: 0.45, name: "CO2 Gas" },
      ]
    ),
  },
  {
    id: 'epsilon-indi-b',
    name: "Epsilon Indi B",
    category: 'brown-dwarf',
    categoryLabel: 'Binary Brown Dwarf System',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: "A binary system of two cold methane brown dwarfs (T1 + T6) orbiting the nearby star Epsilon Indi.",
    significance: "Demonstrates tracking high proper motion (~4.7 arcsec/yr) in a multi-body brown dwarf system.",
    ra: 331.0438,
    dec: -56.7828,
    raString: "22h 04m 10.51s",
    decString: "-56° 46' 58.08\"",
    properMotion: {
      pmRA: 3961.4,
      pmDec: -2538.3,
      totalArcsecPerYear: 4.70,
    },
    recommendedFOV: 20,
    spectralFeatures: ["Methane CH4 (2.2µm)", "Ammonia NH3 (3.0µm)", "H2 Collision-Induced Absorption"],
    mockSpectrum: generateSPHERExSpectrum(
      (wl) => (wl > 2.0 ? 0.7 : 0.3) * Math.sin(wl * 1.5) * 0.4 + 0.4,
      [
        { wl: 1.6, width: 0.12, depth: 0.5, name: "CH4 Band" },
        { wl: 2.2, width: 0.18, depth: 0.6, name: "CH4 Band" },
        { wl: 3.3, width: 0.25, depth: 0.55, name: "NH3 Ammonia" },
      ]
    ),
  },
  {
    id: 'rw-aurigae',
    name: "RW Aurigae",
    category: 'variable-star',
    categoryLabel: 'T Tauri Young Variable Star',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: "A binary young stellar system undergoing dramatic, erratic dimming by giant circum-stellar dust streams.",
    significance: "Tests photometric variability. Between epochs, it can drop up to 3-4 magnitudes (40x brightness change).",
    ra: 76.9564,
    dec: 30.4014,
    raString: "05h 07m 49.54s",
    decString: "+30° 24' 05.04\"",
    variability: {
      periodDays: 0, // Erratic / Aperiodic
      magnitudeRange: "10.1 - 13.9 V",
      type: "UXOR / T Tauri Variable",
    },
    recommendedFOV: 15,
    spectralFeatures: ["Warm Dust Excess (3.4µm)", "Silicate Emission (0.9µm)", "CO Overtone"],
    mockSpectrum: generateSPHERExSpectrum(
      (wl) => 0.4 + 0.12 * wl, // Infrared dust excess (rising into IR)
      [
        { wl: 1.08, width: 0.1, depth: 0.2, name: "He I Accretion" },
        { wl: 2.3, width: 0.15, depth: 0.3, name: "CO Gas" },
        { wl: 4.6, width: 0.25, depth: 0.25, name: "Warm Circumstellar Disk" },
      ]
    ),
  },
  {
    id: 'r-draconis',
    name: "R Draconis",
    category: 'variable-star',
    categoryLabel: 'Mira-Type Pulsating Giant',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: "A pulsating red giant star that expands and contracts over a ~245.6-day cycle.",
    significance: "Blinks like a cosmic lighthouse between SPHEREx 6-month passes, swinging over 600x in brightness!",
    ra: 248.1675,
    dec: 66.7550,
    raString: "16h 32m 40.20s",
    decString: "+66° 45' 18.00\"",
    variability: {
      periodDays: 245.6,
      magnitudeRange: "6.7 - 13.2 V",
      type: "Mira Pulsating Variable",
    },
    recommendedFOV: 15,
    spectralFeatures: ["Molecular CO (2.3µm & 4.6µm)", "H2O Vapor Absorption", "Silicate Dust (4.8µm)"],
    mockSpectrum: generateSPHERExSpectrum(
      (wl) => 0.85 * Math.exp(-Math.pow(wl - 2.0, 2) / 4.0) + 0.15,
      [
        { wl: 1.4, width: 0.2, depth: 0.45, name: "H2O Absorption" },
        { wl: 1.9, width: 0.25, depth: 0.50, name: "H2O Absorption" },
        { wl: 2.35, width: 0.18, depth: 0.40, name: "CO Bandhead" },
        { wl: 4.67, width: 0.22, depth: 0.48, name: "CO Fundamental" },
      ]
    ),
  },
];

export const OFFICIAL_TARGETS: AstroTarget[] = BASE_TARGETS.map((t) => {
  const meta = (spherexManifest as Record<string, any>)[t.id];
  return {
    ...t,
    spherexCutouts: meta?.spherex_cutouts || [],
    archivalComparison: meta?.archival_comparison,
  };
});

