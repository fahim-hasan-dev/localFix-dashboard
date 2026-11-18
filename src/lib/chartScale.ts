export interface ChartTick {
  label: string;
  /** 0 (bottom) → 1 (top) position along the y axis */
  ratio: number;
}

export interface ChartScale {
  max: number;
  ticks: ChartTick[];
}

const TICK_COUNT = 4;
const NICE_STEPS = [1, 2, 2.5, 5, 10];

/** Round a positive step up to 1 / 2 / 2.5 / 5 × 10ⁿ. */
function niceStep(rawStep: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const nice = NICE_STEPS.find((step) => normalized <= step) ?? 10;
  return nice * magnitude;
}

function trimDecimal(value: number): string {
  return Number(value.toFixed(1)).toString();
}

/** 1500 → "1.5K", 2_000_000 → "2M" */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trimDecimal(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trimDecimal(value / 1_000)}K`;
  return trimDecimal(value);
}

/**
 * Build a y-axis scale (5 gridlines: 0 … max) from the series maximum.
 * `minMax` keeps the axis readable when there is no data / tiny values.
 */
export function buildChartScale(
  dataMax: number,
  options: { minMax: number; formatLabel?: (value: number) => string }
): ChartScale {
  const { minMax, formatLabel = formatCompactNumber } = options;
  const safeMax = Number.isFinite(dataMax) ? Math.max(dataMax, 0) : 0;
  const step = niceStep(Math.max(safeMax, minMax) / TICK_COUNT);
  const max = step * TICK_COUNT;

  const ticks: ChartTick[] = Array.from({ length: TICK_COUNT + 1 }, (_, i) => ({
    label: formatLabel(step * (TICK_COUNT - i)),
    ratio: (TICK_COUNT - i) / TICK_COUNT,
  }));

  return { max, ticks };
}
