import type { Coordinates } from '../types';

/**
 * Converts decimal RA degrees [0, 360) to sexagesimal string "08h 55m 10.83s"
 */
export function formatRA(raDeg: number): string {
  // Normalize to [0, 360)
  let normalized = ((raDeg % 360) + 360) % 360;
  const hoursTotal = normalized / 15;
  const h = Math.floor(hoursTotal);
  const mTotal = (hoursTotal - h) * 60;
  const m = Math.floor(mTotal);
  const s = (mTotal - m) * 60;

  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toFixed(2).padStart(5, '0');
  return `${hh}h ${mm}m ${ss}s`;
}

/**
 * Converts decimal Dec degrees [-90, +90] to sexagesimal string "+04° 41' 36.20\""
 */
export function formatDec(decDeg: number): string {
  const sign = decDeg < 0 ? '-' : '+';
  const absDec = Math.abs(decDeg);
  const d = Math.floor(absDec);
  const mTotal = (absDec - d) * 60;
  const m = Math.floor(mTotal);
  const s = (mTotal - m) * 60;

  const dd = d.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toFixed(2).padStart(5, '0');
  return `${sign}${dd}° ${mm}' ${ss}"`;
}

/**
 * Parses sexagesimal RA string (e.g. "08h 55m 10.83s" or "08:55:10.83" or "08 55 10.83")
 * or bare decimal number into decimal degrees [0, 360).
 */
export function parseRA(input: string): number | null {
  const clean = input.trim();
  if (!clean) return null;

  // Check if it's already a decimal number
  const num = parseFloat(clean);
  if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(clean)) {
    return ((num % 360) + 360) % 360;
  }

  // Match pattern: 08h 55m 10.83s or 08:55:10.83 or 08 55 10.83
  const regex = /(\d{1,2})[h:\s]+(\d{1,2})[m:\s]+(\d{1,2}(?:\.\d+)?)[s\s]?/i;
  const match = clean.match(regex);
  if (match) {
    const h = parseFloat(match[1]);
    const m = parseFloat(match[2]);
    const s = parseFloat(match[3]);
    if (h < 0 || h >= 24 || m < 0 || m >= 60 || s < 0 || s >= 60) return null;
    const hours = h + m / 60 + s / 3600;
    return (hours * 15) % 360;
  }

  return null;
}

/**
 * Parses sexagesimal Dec string (e.g. "-07d 14m 42.53s" or "-07:14:42.53" or "-07° 14' 42\"")
 * or bare decimal number into decimal degrees [-90, +90].
 */
export function parseDec(input: string): number | null {
  const clean = input.trim();
  if (!clean) return null;

  // Check if it's already a decimal number
  const num = parseFloat(clean);
  if (!isNaN(num) && /^[+-]?\d+(\.\d+)?$/.test(clean)) {
    if (num < -90 || num > 90) return null;
    return num;
  }

  // Match pattern: +/-DD d/°/:\s MM m/':\s SS s/":\s
  const regex = /([+-]?\d{1,2})[d°:\s]+(\d{1,2})[m':\s]+(\d{1,2}(?:\.\d+)?)[s"\s]?/i;
  const match = clean.match(regex);
  if (match) {
    const d = parseFloat(match[1]);
    const m = parseFloat(match[2]);
    const s = parseFloat(match[3]);
    if (Math.abs(d) > 90 || m < 0 || m >= 60 || s < 0 || s >= 60) return null;
    const sign = match[1].trim().startsWith('-') ? -1 : 1;
    const absDeg = Math.abs(d) + m / 60 + s / 3600;
    const result = sign * absDeg;
    if (result < -90 || result > 90) return null;
    return result;
  }

  return null;
}

/**
 * Parses a combined string or checks pair of RA and Dec.
 */
export function parseCoordinates(raInput: string, decInput: string): Coordinates | null {
  const ra = parseRA(raInput);
  const dec = parseDec(decInput);

  if (ra === null || dec === null) return null;

  return {
    ra,
    dec,
    raString: formatRA(ra),
    decString: formatDec(dec),
  };
}
