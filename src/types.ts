export interface Coordinates {
  ra: number;       // Decimal degrees [0, 360)
  dec: number;      // Decimal degrees [-90, +90]
  raString: string; // Formatted sexagesimal e.g. "08h 55m 10.83s"
  decString: string;// Formatted sexagesimal e.g. "-07° 14' 42.53\""
}

export type TargetCategory = 'proper-motion' | 'variable-star' | 'asteroid' | 'brown-dwarf';

export interface SpectralPoint {
  wavelength: number; // in microns (0.75 - 5.0)
  flux: number;       // Normalized flux (0 - 1)
  featureName?: string; // e.g. "H2O Ice", "CO2 Ice", "CH4", "CO"
}

export interface SPHERExCutout {
  url: string;
  time_mjd: string;
  time_mjd_upper?: string;
  bandpass: string;
}

export interface AstroTarget {
  id: string;
  name: string;
  category: TargetCategory;
  categoryLabel: string;
  badgeColor: string;
  description: string;
  significance: string;
  ra: number;       // Decimal degrees
  dec: number;      // Decimal degrees
  raString: string;
  decString: string;
  properMotion?: {
    pmRA: number;  // mas/yr (milliarcseconds per year)
    pmDec: number; // mas/yr
    totalArcsecPerYear: number;
  };
  variability?: {
    periodDays?: number;
    magnitudeRange?: string;
    type: string;
  };
  recommendedFOV: number; // arcmin
  spectralFeatures: string[];
  mockSpectrum: SpectralPoint[];
  spherexCutouts?: SPHERExCutout[];
  archivalComparison?: {
    epoch1_url: string;
    epoch2_url: string;
  };
}

export interface EpochImage {
  epochIndex: number;
  epochLabel: string;
  surveyDate: string; // e.g. "May 2025 (Survey 1)"
  imageSrc?: string;  // DataURL or URL
}

export type ViewMode = 'blink' | 'difference' | 'coadd';

export interface DiscoveryReport {
  id: string;
  targetName: string;
  ra: number;
  dec: number;
  raString: string;
  decString: string;
  category: string;
  epochComparison: string;
  apparentShiftArcsec?: number;
  notes: string;
  timestamp: string;
}
