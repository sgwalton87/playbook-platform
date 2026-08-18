export const FEED_PAGE_SIZE = 20;
export const FEED_IDENTITY_BATCH_SIZE = 100;

export type FeedCursor = {
  createdAt: string;
  id: string;
};

export function chunkFeedIds(ids: Array<string | null | undefined>, size = FEED_IDENTITY_BATCH_SIZE) {
  const boundedSize = Math.max(1, Math.min(size, FEED_IDENTITY_BATCH_SIZE));
  const unique = [...new Set(ids.filter((value): value is string => Boolean(value)))];
  const chunks: string[][] = [];
  for (let index = 0; index < unique.length; index += boundedSize) {
    chunks.push(unique.slice(index, index + boundedSize));
  }
  return chunks;
}

export function appendUniqueFeedRows<T extends { id: string }>(current: T[], incoming: T[]) {
  const byId = new Map(current.map((row) => [row.id, row]));
  for (const row of incoming) byId.set(row.id, row);
  return [...byId.values()];
}

export function cursorFromLast<T extends { id: string; createdAt: string }>(rows: T[]): FeedCursor | null {
  const last = rows.at(-1);
  return last ? { id: last.id, createdAt: last.createdAt } : null;
}
