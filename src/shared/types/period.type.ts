export type TsLabel = 'TS' | 'TS-1' | 'TS-2' | 'TS-3';

export type ResolvedYear = { id: string; label: TsLabel; startYear: number };

export type ResolvedPeriod = {
  ts3: ResolvedYear;
  ts2: ResolvedYear;
  ts1: ResolvedYear;
  ts: ResolvedYear;
};
