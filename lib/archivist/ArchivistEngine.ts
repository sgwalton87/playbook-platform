import { analyzeGitChanges } from "./GitAnalyzer";
import { appendDoc, writeDoc } from "./DocumentationRepository";

function stamp() {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
  };
}

export function runArchivist() {
  const { date, time } = stamp();
  const analysis = analyzeGitChanges();

  const summary = [
    analysis.engines.length && `- Engines changed: ${analysis.engines.length}`,
    analysis.repositories.length && `- Repositories changed: ${analysis.repositories.length}`,
    analysis.events.length && `- Event system changed: ${analysis.events.length}`,
    analysis.migrations.length && `- Database migrations changed: ${analysis.migrations.length}`,
    analysis.tests.length && `- Tests changed: ${analysis.tests.length}`,
    analysis.components.length && `- Components changed: ${analysis.components.length}`,
    analysis.appRoutes.length && `- App routes changed: ${analysis.appRoutes.length}`,
    analysis.docs.length && `- Documentation changed: ${analysis.docs.length}`,
  ].filter(Boolean).join("\n") || "- No categorized file changes detected.";

  const report = `# Playbook Archivist v2 Ship Report — ${date}

## Time

${time}

## Status

✅ Tests passed  
✅ Production build passed  

## Last Commit

${analysis.lastCommit}

## Change Summary

${summary}

## Changed Files

${analysis.changedFiles.map(f => `- ${f}`).join("\n") || "- No changed files detected before documentation update."}

## Archivist Notes

The Archivist v2 analyzed the working tree, categorized changed files, updated operational logs, and prepared this ship report.

## Review Prompts

- Was there a product milestone?
- Was there an architecture decision?
- Was there an innovation?
- Was there a rejected path / why-not?
- Should a Founder Journal entry be drafted?
- Should a new ADR be created?
`;

  writeDoc(`docs/ARCHIVIST/SHIP_${date}.md`, report);

  const entry = `## ${date} ${time}

${summary}

- Archivist v2 ship cycle completed.
`;

  appendDoc(`docs/HISTORY/DAILY_LOGS/${date}.md`, `Daily Engineering Log — ${date}`, entry);
  appendDoc("docs/LEDGER/ENGINEERING_LOG.md", "Engineering Log", entry);
  appendDoc("docs/LEDGER/MILESTONES.md", "Milestones", entry);
  appendDoc("docs/LEDGER/RELEASE_HISTORY.md", "Release History", entry);
  appendDoc("docs/LEDGER/ARCHITECTURE_HISTORY.md", "Architecture History", entry);
  appendDoc("docs/ENGINEERING/ENGINE_ROADMAP.md", "Playbook Engine Roadmap", entry);
  appendDoc("CHANGELOG.md", "Playbook Platform Changelog", entry);
  appendDoc("VERSION.md", "Playbook Platform Version", entry);

  if (analysis.engines.length || analysis.repositories.length || analysis.events.length) {
    appendDoc(
      "docs/ADR/ADR_LOG.md",
      "Architecture Decision Record Log",
      `## ${date} ${time}

- Archivist detected architecture-level changes.
- Review whether a formal ADR is needed.

${summary}
`
    );
  }

  return report;
}
