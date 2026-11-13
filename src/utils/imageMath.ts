/**
 * Computes difference image: ImageData(Epoch B) - ImageData(Epoch A)
 * Directly operates on the pixels of authentic NASA photographs.
 * Static background stars cancel out to mid-grey (128).
 * Moving stars/brown dwarfs/asteroids show up as distinct dipoles (white/black pairs).
 * Variable stars show up as bright flares or dark spots!
 */
export function computeImageDifference(
  ctxA: CanvasRenderingContext2D,
  ctxB: CanvasRenderingContext2D,
  width: number,
  height: number
): ImageData {
  const dataA = ctxA.getImageData(0, 0, width, height);
  const dataB = ctxB.getImageData(0, 0, width, height);
  const diffData = new ImageData(width, height);

  const len = dataA.data.length;
  for (let i = 0; i < len; i += 4) {
    // Luminance subtraction from real image bytes
    const lumA = (dataA.data[i] * 0.299 + dataA.data[i + 1] * 0.587 + dataA.data[i + 2] * 0.114);
    const lumB = (dataB.data[i] * 0.299 + dataB.data[i + 1] * 0.587 + dataB.data[i + 2] * 0.114);

    // Difference centered at mid-grey (128) with high-contrast sensitivity boost for faint brown dwarfs
    const diff = Math.min(255, Math.max(0, 128 + (lumB - lumA) * 3.5));

    diffData.data[i] = diff;     // R
    diffData.data[i + 1] = diff; // G
    diffData.data[i + 2] = diff; // B
    diffData.data[i + 3] = 255;  // Alpha
  }

  return diffData;
}

/**
 * Computes Co-addition (Summation) of two real epochs: (A + B) / 2
 * Stacks real NASA exposures to boost Signal-to-Noise Ratio (SNR).
 */
export function computeImageCoadd(
  ctxA: CanvasRenderingContext2D,
  ctxB: CanvasRenderingContext2D,
  width: number,
  height: number
): ImageData {
  const dataA = ctxA.getImageData(0, 0, width, height);
  const dataB = ctxB.getImageData(0, 0, width, height);
  const coaddData = new ImageData(width, height);

  const len = dataA.data.length;
  for (let i = 0; i < len; i += 4) {
    const r = Math.min(255, (dataA.data[i] + dataB.data[i]) * 0.55);
    const g = Math.min(255, (dataA.data[i + 1] + dataB.data[i + 1]) * 0.55);
    const b = Math.min(255, (dataA.data[i + 2] + dataB.data[i + 2]) * 0.55);

    coaddData.data[i] = r;
    coaddData.data[i + 1] = g;
    coaddData.data[i + 2] = b;
    coaddData.data[i + 3] = 255;
  }

  return coaddData;
}
