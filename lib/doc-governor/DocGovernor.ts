import { scanDocs } from "./DocScanner";

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function runDocGovernor() {
  const docs = scanDocs();
  const byCategory = groupBy(docs, doc => doc.category);
  const emptyDocs = docs.filter(doc => doc.isEmpty);
  const generatedDocs = docs.filter(doc => doc.isGenerated);
  const humanDocs = docs.filter(doc => !doc.isGenerated);

  const duplicateCandidates = Object.entries(byCategory)
    .filter(([, items]) => items.length > 3)
    .map(([category, items]) => ({
      category,
      count: items.length,
      files: items.map(item => item.file),
    }));

  const healthPenalty =
    emptyDocs.length * 2 +
    duplicateCandidates.length * 3;

  const healthScore = Math.max(0, Math.min(100, 100 - healthPenalty));

  return {
    totalDocs: docs.length,
    generatedDocs: generatedDocs.length,
    humanDocs: humanDocs.length,
    emptyDocs,
    duplicateCandidates,
    byCategory,
    healthScore,
    docs,
  };
}
