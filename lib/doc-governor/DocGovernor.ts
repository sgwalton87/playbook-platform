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
  const byType = groupBy(docs, doc => doc.metadata.doc_type);

  const thinDocs = docs.filter(doc => doc.isThin);
  const generatedDocs = docs.filter(doc => doc.isGenerated);
  const frozenDocs = docs.filter(doc => doc.isFrozen);
  const canonicalDocs = docs.filter(doc => doc.isCanonical);

  const duplicateCandidates = Object.entries(byType)
    .filter(([, items]) => items.length > 3)
    .map(([docType, items]) => ({
      docType,
      count: items.length,
      canonical: items.filter(item => item.isCanonical).map(item => item.file),
      files: items.map(item => item.file),
    }));

  const staleDocs = docs.filter(doc => {
    if (doc.isGenerated || doc.isFrozen) return false;
    const ageDays = Math.floor((Date.now() - doc.modifiedAt.getTime()) / (1000 * 60 * 60 * 24));
    return ageDays > 90;
  });

  const metadataScore = Math.round((docs.filter(doc => doc.metadata.title && doc.metadata.owner).length / Math.max(1, docs.length)) * 100);
  const thinScore = Math.max(0, 100 - thinDocs.length * 2);
  const duplicateScore = Math.max(0, 100 - duplicateCandidates.length * 5);
  const staleScore = Math.max(0, 100 - staleDocs.length * 2);
  const canonicalScore = Math.round((canonicalDocs.length / Math.max(1, docs.length)) * 100);

  const healthScore = Math.round(
    (metadataScore + thinScore + duplicateScore + staleScore + canonicalScore) / 5
  );

  return {
    docs,
    byType,
    thinDocs,
    generatedDocs,
    frozenDocs,
    canonicalDocs,
    duplicateCandidates,
    staleDocs,
    scores: {
      overall: healthScore,
      metadata: metadataScore,
      thinDocs: thinScore,
      duplicateRisk: duplicateScore,
      staleDocs: staleScore,
      canonicalCoverage: canonicalScore,
    },
  };
}
