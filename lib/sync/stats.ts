import type { YearGroup } from "./grouping";

export interface YearStats {
  totalTracks: number;
  yearDistribution: Array<{
    year: number;
    count: number;
    percentage: number;
  }>;
  topYear: {
    year: number;
    count: number;
  } | null;
  earliestYear: number | null;
  latestYear: number | null;
}

export function calculateYearStats(groups: Map<number, YearGroup>): YearStats {
  const years = Array.from(groups.keys()).sort((a, b) => b - a); // descending order, most recent year first

  let totalTracks = 0;
  for (const g of groups.values()) {
    totalTracks += g.tracks.length;
  }

  if (totalTracks === 0) {
    return {
      totalTracks: 0,
      yearDistribution: [],
      topYear: null,
      earliestYear: null,
      latestYear: null,
    };
  }

  const distribution = years.map((year) => {
    const count = groups.get(year)?.tracks.length || 0;
    const percentage = Math.round((count / totalTracks) * 1000) / 10;
    return { year, count, percentage };
  });

  let topYear: { year: number; count: number } | null = null;
  for (const item of distribution) {
    if (!topYear || item.count > topYear.count) {
      topYear = { year: item.year, count: item.count };
    }
  }

  const chronologicalYears = [...years].sort((a, b) => a - b);
  const earliestYear = chronologicalYears[0] ?? null;
  const latestYear = chronologicalYears[chronologicalYears.length - 1] ?? null;

  return {
    totalTracks,
    yearDistribution: distribution,
    topYear,
    earliestYear,
    latestYear,
  };
}
