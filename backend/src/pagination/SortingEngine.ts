export type PaperSortKey = 'latest' | 'stars' | 'citations' | 'alphabetical' | 'ranking' | 'trending' | string;

export type SortDirection = 'asc' | 'desc';

export type SortCursorValue = string | number | null;

export interface SortablePaper {
  id: string;
  slug: string;
  title: string;
  publicationDate?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
  githubStars?: number | null;
  citationCount?: number | null;
  trendingScore?: number | null;
  rankings?: Array<{ rank?: number | null }> | null;
}

export interface SortCursorPayload {
  sort: string;
  id: string;
  slug: string;
  values: SortCursorValue[];
}

type SortField<T extends SortablePaper> = {
  direction: SortDirection;
  getValue: (paper: T) => SortCursorValue;
};

const toTime = (value: Date | string | null | undefined): number | null => {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const toNumber = (value: number | null | undefined): number => value ?? 0;

const minRank = (paper: SortablePaper): number | null => {
  if (!paper.rankings?.length) return null;

  const ranks = paper.rankings
    .map((ranking) => ranking.rank)
    .filter((rank): rank is number => typeof rank === 'number');

  return ranks.length ? Math.min(...ranks) : null;
};

const compareValues = (
  a: SortCursorValue,
  b: SortCursorValue,
  direction: SortDirection
): number => {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  let result: number;
  if (typeof a === 'string' || typeof b === 'string') {
    result = String(a).localeCompare(String(b));
  } else {
    result = a < b ? -1 : 1;
  }

  return direction === 'asc' ? result : -result;
};

export class SortingEngine {
  static normalizeSort(sort?: PaperSortKey): string {
    const normalized = String(sort || 'trending').toLowerCase();

    if (['latest', 'publication_date', 'publicationdate', 'date', 'newest'].includes(normalized)) {
      return 'latest';
    }

    if (['stars', 'github_stars', 'githubstars', 'github'].includes(normalized)) {
      return 'stars';
    }

    if (['citations', 'citation', 'citation_count', 'citationcount'].includes(normalized)) {
      return 'citations';
    }

    if (['alphabetical', 'alpha', 'title', 'name'].includes(normalized)) {
      return 'alphabetical';
    }

    if (['ranking', 'rank'].includes(normalized)) {
      return 'ranking';
    }

    return 'trending';
  }

  static getSortFields<T extends SortablePaper>(sort?: PaperSortKey): SortField<T>[] {
    const normalized = this.normalizeSort(sort);

    if (normalized === 'latest') {
      return [
        { direction: 'desc', getValue: (paper) => toTime(paper.publicationDate) },
        { direction: 'desc', getValue: (paper) => toNumber(paper.githubStars) },
        { direction: 'asc', getValue: (paper) => paper.slug },
      ];
    }

    if (normalized === 'stars') {
      return [
        { direction: 'desc', getValue: (paper) => toNumber(paper.githubStars) },
        { direction: 'desc', getValue: (paper) => toNumber(paper.citationCount) },
        { direction: 'desc', getValue: (paper) => toTime(paper.publicationDate) },
        { direction: 'asc', getValue: (paper) => paper.slug },
      ];
    }

    if (normalized === 'citations') {
      return [
        { direction: 'desc', getValue: (paper) => toNumber(paper.citationCount) },
        { direction: 'desc', getValue: (paper) => toNumber(paper.githubStars) },
        { direction: 'desc', getValue: (paper) => toTime(paper.publicationDate) },
        { direction: 'asc', getValue: (paper) => paper.slug },
      ];
    }

    if (normalized === 'alphabetical') {
      return [
        { direction: 'asc', getValue: (paper) => paper.title.toLowerCase() },
        { direction: 'asc', getValue: (paper) => paper.slug },
      ];
    }

    if (normalized === 'ranking') {
      return [
        { direction: 'asc', getValue: (paper) => minRank(paper) },
        { direction: 'desc', getValue: (paper) => toNumber(paper.githubStars) },
        { direction: 'desc', getValue: (paper) => toNumber(paper.citationCount) },
        { direction: 'desc', getValue: (paper) => toTime(paper.publicationDate) },
        { direction: 'asc', getValue: (paper) => paper.slug },
      ];
    }

    return [
      { direction: 'desc', getValue: (paper) => toNumber(paper.trendingScore) || toNumber(paper.githubStars) },
      { direction: 'desc', getValue: (paper) => toNumber(paper.githubStars) },
      { direction: 'desc', getValue: (paper) => toNumber(paper.citationCount) },
      { direction: 'desc', getValue: (paper) => toTime(paper.publicationDate) },
      { direction: 'asc', getValue: (paper) => paper.slug },
    ];
  }

  static compare<T extends SortablePaper>(sort?: PaperSortKey): (a: T, b: T) => number {
    const fields = this.getSortFields<T>(sort);

    return (a, b) => {
      for (const field of fields) {
        const result = compareValues(field.getValue(a), field.getValue(b), field.direction);
        if (result !== 0) return result;
      }

      return a.id.localeCompare(b.id);
    };
  }

  static getCursorPayload<T extends SortablePaper>(paper: T, sort?: PaperSortKey): SortCursorPayload {
    const normalizedSort = this.normalizeSort(sort);
    const values = this.getSortFields<T>(normalizedSort).map((field) => field.getValue(paper));

    return {
      sort: normalizedSort,
      id: paper.id,
      slug: paper.slug,
      values,
    };
  }

  static sort<T extends SortablePaper>(papers: T[], sort?: PaperSortKey): T[] {
    return [...papers].sort(this.compare<T>(sort));
  }

  static nWayMerge<T extends SortablePaper>(shardResults: T[][], sort?: PaperSortKey): T[] {
    const compare = this.compare<T>(sort);
    const indexes = shardResults.map(() => 0);
    const merged: T[] = [];

    while (true) {
      let bestShardIndex = -1;
      let bestPaper: T | null = null;

      for (let shardIndex = 0; shardIndex < shardResults.length; shardIndex += 1) {
        const paper = shardResults[shardIndex][indexes[shardIndex]];
        if (!paper) continue;

        if (!bestPaper || compare(paper, bestPaper) < 0) {
          bestPaper = paper;
          bestShardIndex = shardIndex;
        }
      }

      if (!bestPaper || bestShardIndex === -1) break;

      merged.push(bestPaper);
      indexes[bestShardIndex] += 1;
    }

    return merged;
  }

  static findCursorIndex<T extends SortablePaper>(papers: T[], cursor: SortCursorPayload): number {
    return papers.findIndex((paper) => paper.id === cursor.id || paper.slug === cursor.slug);
  }
}
