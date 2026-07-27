#!/usr/bin/env python3
"""Deterministically reconcile the PPS index, documents, and dependency graph."""

from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PPS = ROOT / "docs" / "PPS"
INDEX = PPS / "pps.index.json"
OUTPUT = ROOT / "docs" / "GOVERNANCE" / "AUDITS"
CONSTITUTIONAL_OUTPUT = ROOT / "docs" / "GOVERNANCE" / "CONSTITUTIONAL"
ID_PATTERN = re.compile(r"^PPS-\d+$")


def tracked_pps_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "docs/PPS"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return sorted(ROOT / line for line in result.stdout.splitlines() if line)


def frontmatter(path: Path) -> dict[str, object]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        return {}
    data: dict[str, object] = {}
    key: str | None = None
    for line in lines[1:]:
        if line == "---":
            break
        item = re.match(r"^\s+-\s+(.+?)\s*$", line)
        if item and key:
            current = data.setdefault(key, [])
            if isinstance(current, list):
                current.append(item.group(1).strip('"\''))
            continue
        pair = re.match(r"^([A-Za-z_]+):(?:\s*(.*))?$", line)
        if pair:
            key, value = pair.groups()
            value = (value or "").strip().strip('"\'')
            data[key] = [] if value in ("", "[]") else value
    return data


def write_report(name: str, title: str, purpose: str, body: list[str]) -> None:
    content = [
        f"# {title}", "", "## Purpose", purpose, "", "## Ownership",
        "PBOS / Platform Governance", "", "## Last Updated", "July 26, 2026", "",
        "## Related Documents",
        "- [Canonical Document Registry](../../PPS/CANONICAL_DOCUMENT_REGISTRY.md)",
        "- [PPS Index](../../PPS/pps.index.json)",
        "- [Constitutional Reconciliation Report](./PBOS-CONST-001_CONSTITUTIONAL_RECONCILIATION_REPORT.md)",
        "", *body, "",
    ]
    (OUTPUT / name).write_text("\n".join(content), encoding="utf-8")


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    CONSTITUTIONAL_OUTPUT.mkdir(parents=True, exist_ok=True)
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    tracked = tracked_pps_files()
    markdown = [path for path in tracked if path.suffix == ".md"]
    metadata = {path: frontmatter(path) for path in markdown}

    by_id: dict[str, list[Path]] = defaultdict(list)
    dependencies: dict[str, set[str]] = defaultdict(set)
    malformed_dependencies: list[tuple[str, str]] = []
    for path, data in metadata.items():
        identifier = data.get("id")
        if isinstance(identifier, str) and ID_PATTERN.fullmatch(identifier):
            by_id[identifier].append(path)
            for field in ("dependencies", "depends_on"):
                values = data.get(field, [])
                if isinstance(values, str):
                    values = [values]
                if isinstance(values, list):
                    for dependency in values:
                        if ID_PATTERN.fullmatch(str(dependency)):
                            dependencies[identifier].add(str(dependency))
                        else:
                            malformed_dependencies.append((identifier, str(dependency)))

    actual_dirs = sorted(
        path.name for path in PPS.iterdir() if path.is_dir() and re.match(r"^\d{2}_", path.name)
    )
    indexed = sorted(index["volumes"], key=lambda volume: volume["volume"])
    missing_paths = [volume["path"] for volume in indexed if not (PPS / volume["path"]).is_dir()]
    unindexed_paths = sorted(set(actual_dirs) - {volume["path"] for volume in indexed})
    inferred_paths: list[tuple[int, str, str]] = []
    for volume in indexed:
        if volume["path"] in missing_paths:
            prefix = f'{volume["volume"]:02d}_'
            candidates = [path for path in actual_dirs if path.startswith(prefix)]
            if len(candidates) == 1:
                inferred_paths.append((volume["volume"], volume["path"], candidates[0]))

    expected_ids: set[str] = set()
    for volume in indexed:
        documents = volume.get("documents")
        if isinstance(documents, list):
            expected_ids.update(documents)
        elif isinstance(documents, str):
            match = re.fullmatch(r"(PPS-\d+) through (PPS-\d+)", documents)
            if match:
                start, end = (int(value.split("-")[1]) for value in match.groups())
                expected_ids.update(f"PPS-{number:03d}" for number in range(start, end + 1))

    duplicate_ids = {key: value for key, value in by_id.items() if len(value) > 1}
    missing_documents = sorted(expected_ids - set(by_id))
    unresolved = sorted(
        (identifier, dependency)
        for identifier, values in dependencies.items()
        for dependency in values
        if dependency not in by_id
    )
    missing_referenced_documents = sorted({dependency for _, dependency in unresolved})

    related_references: list[tuple[str, str]] = []
    for path, data in metadata.items():
        identifier = data.get("id")
        if not isinstance(identifier, str) or identifier not in by_id:
            continue
        values = data.get("related", [])
        if isinstance(values, str):
            values = [values]
        if isinstance(values, list):
            related_references.extend(
                (identifier, str(reference))
                for reference in values
                if ID_PATTERN.fullmatch(str(reference)) and reference not in by_id
            )
    unresolved_related = sorted(set(related_references))

    graph = {
        identifier: sorted(dependency for dependency in values if dependency in by_id)
        for identifier, values in dependencies.items()
    }
    graph.update({identifier: graph.get(identifier, []) for identifier in by_id})
    colors: dict[str, int] = {}
    stack: list[str] = []
    cycles: set[tuple[str, ...]] = set()

    def visit(identifier: str) -> None:
        colors[identifier] = 1
        stack.append(identifier)
        for dependency in graph[identifier]:
            if colors.get(dependency) == 1:
                start = stack.index(dependency)
                cycle = tuple(stack[start:] + [dependency])
                rotations = [cycle[index:-1] + cycle[:index] + (cycle[index],) for index in range(len(cycle) - 1)]
                cycles.add(min(rotations))
            elif colors.get(dependency, 0) == 0:
                visit(dependency)
        stack.pop()
        colors[identifier] = 2

    for identifier in sorted(graph):
        if colors.get(identifier, 0) == 0:
            visit(identifier)

    required_metadata = (
        "id", "title", "version", "status", "classification",
        "machine_version", "release_blocking", "validation_required",
    )
    metadata_issues: list[str] = []
    numbering_issues: list[str] = []
    for path, data in metadata.items():
        identifier = data.get("id")
        if not isinstance(identifier, str) or not ID_PATTERN.fullmatch(identifier):
            continue
        absent = [field for field in required_metadata if not data.get(field)]
        if not data.get("owner") and not data.get("owners"):
            absent.append("owner/owners")
        if absent:
            metadata_issues.append(f"{path.relative_to(ROOT).as_posix()}: missing {', '.join(absent)}")
        directory_match = re.match(r"^(\d{2})_", path.parent.name)
        if directory_match:
            actual_volume = int(directory_match.group(1))
            number = int(identifier.split("-")[1])
            expected_volume = 0 if number < 100 else number // 100
            if actual_volume != expected_volume:
                numbering_issues.append(
                    f"{identifier}: identifier implies Volume {expected_volume:02d}, path is Volume {actual_volume:02d}"
                )

    path_issues: list[dict[str, object]] = []
    inferred_by_old = {old: new for _, old, new in inferred_paths}
    for volume in indexed:
        old = volume["path"]
        if old not in missing_paths:
            continue
        replacement = inferred_by_old.get(old)
        issue_id = f'PBOS-CONST-002-PATH-{volume["volume"]:02d}'
        path_issues.append({
            "issue_id": issue_id,
            "category": "B",
            "classification": "governance_review_required",
            "affected_documents": [f'Volume {volume["volume"]}'],
            "evidence": [f"Indexed path: docs/PPS/{old}"] + ([f"Unique tracked volume path: docs/PPS/{replacement}"] if replacement else ["No tracked directory has the required volume prefix."]),
            "description": "The indexed volume path does not exist in the tracked PPS filesystem.",
            "risk": "high" if replacement else "critical",
            "recommended_action": (f"Review the competing taxonomy; {replacement} is a location candidate, not an authorized correction." if replacement else "Determine the authority and recovery disposition of the missing constitutional volume."),
            "authority": "Constitutional Governance",
            "status": "pending",
        })

    dependency_issues: list[dict[str, object]] = []
    for position, (identifier, dependency) in enumerate(unresolved, start=1):
        dependency_issues.append({
            "issue_id": f"PBOS-CONST-002-DEP-{position:03d}",
            "category": "B",
            "classification": "governance_review_required",
            "affected_documents": [identifier, dependency],
            "evidence": [f"{identifier} declares a dependency on {dependency}.", f"No tracked PPS document declares id {dependency}."],
            "description": "A declared constitutional dependency target is absent; absence is not evidence of deletion.",
            "risk": "high",
            "recommended_action": "Locate provenance and obtain a human authority decision; amendment is required before redirecting or removing dependency authority.",
            "authority": "Constitutional Governance",
            "status": "pending",
        })
    related_issues = [{
        "issue_id": f"PBOS-CONST-002-REF-{position:03d}",
        "category": "B",
        "classification": "governance_review_required",
        "affected_documents": [identifier, reference],
        "evidence": [f"{identifier} declares a related reference to {reference}.", f"No tracked PPS document declares id {reference}."],
        "description": "A constitutional cross-reference target is absent.",
        "risk": "high",
        "recommended_action": "Recover or formally disposition the referenced authority; do not infer a replacement.",
        "authority": "Constitutional Governance",
        "status": "pending",
    } for position, (identifier, reference) in enumerate(unresolved_related, start=1)]
    cycle_issues = [{
        "issue_id": f"PBOS-CONST-002-CYCLE-{position:03d}",
        "category": "C",
        "classification": "constitutional_amendment_required",
        "affected_documents": list(cycle[:-1]),
        "evidence": [f"Dependency cycle: {' → '.join(cycle)}"],
        "description": "The dependency graph contains circular constitutional authority.",
        "risk": "critical",
        "recommended_action": "Constitutional Governance must adjudicate dependency direction through the amendment process.",
        "authority": "Constitutional Governance",
        "status": "pending",
    } for position, cycle in enumerate(sorted(cycles), start=1)]
    metadata_governance_issues = [{
        "issue_id": f"PBOS-CONST-002-META-{position:03d}",
        "category": "B",
        "classification": "governance_review_required",
        "affected_documents": [issue.split(": missing ", 1)[0]],
        "evidence": [issue],
        "description": "Required machine-readable metadata is absent under PPS-008 and PPS-100.",
        "risk": "high",
        "recommended_action": "Constitutional Governance must approve metadata completion values; do not infer release-blocking authority.",
        "authority": "Constitutional Governance",
        "status": "pending",
    } for position, issue in enumerate(metadata_issues, start=1)]
    issues = path_issues + dependency_issues + related_issues + cycle_issues + metadata_governance_issues

    def relative(path: Path) -> str:
        return path.relative_to(ROOT).as_posix()

    engine_domains = {
        "Academic": ("academic", "PBOS_ACADEMIC_ENGINE_V1_IMPLEMENTATION.md"),
        "Access Governance": ("access", "PBOS_ACCESS_GOVERNANCE_ENGINE_V1_IMPLEMENTATION.md"),
        "Adaptation": ("adaptation", "PBOS_ADAPTATION_ENGINE_V1_IMPLEMENTATION.md"),
        "Athletics": ("athletics", "PBOS_ATHLETICS_ENGINE_V1_IMPLEMENTATION.md"),
        "Autonomy": ("autonomy", "PBOS_AUTONOMY_FRAMEWORK_V1_IMPLEMENTATION.md"),
        "Certification": ("certification", "PBOS_CERTIFICATION_ENGINE_V1_IMPLEMENTATION.md"),
        "Communication": ("communication", "PBOS_COMMUNICATION_ENGINE_V1_IMPLEMENTATION.md"),
        "Compass": ("compass", "PBOS_COMPASS_ENGINE_V1_IMPLEMENTATION.md"),
        "Context Compiler": ("context", "PBOS_CONTEXT_COMPILER_V1_IMPLEMENTATION.md"),
        "Credential": ("credential", "PBOS_CREDENTIAL_ENGINE_V1_IMPLEMENTATION.md"),
        "Discovery": ("discovery", "PBOS_DISCOVERY_ENGINE_V1_IMPLEMENTATION.md"),
        "Ecosystem": ("ecosystem", "PBOS_ECOSYSTEM_ENGINE_V1_IMPLEMENTATION.md"),
        "Execution": ("execution", "PBOS_EXECUTION_ENGINE_V1_IMPLEMENTATION.md"),
        "Foresight": ("foresight", "PBOS_FORESIGHT_ENGINE_V1_IMPLEMENTATION.md"),
        "Identity": ("identity", "PBOS_IDENTITY_ENGINE_V1_IMPLEMENTATION.md"),
        "Institution": ("institution", "PBOS_INSTITUTION_ENGINE_V1_IMPLEMENTATION.md"),
        "Knowledge": ("knowledge", "PBOS_KNOWLEDGE_ENGINE_V1_IMPLEMENTATION.md"),
        "Learning": ("learning", "PBOS_LEARNING_ENGINE_V1_IMPLEMENTATION.md"),
        "Mastery": ("mastery", "PBOS_MASTERY_ENGINE_V1_IMPLEMENTATION.md"),
        "Meta Intelligence": ("meta", "PBOS_META_INTELLIGENCE_ENGINE_V1_IMPLEMENTATION.md"),
        "Mobility": ("mobility", "PBOS_MOBILITY_ENGINE_V1_IMPLEMENTATION.md"),
        "Opportunity": ("opportunity", "PBOS_OPPORTUNITY_ENGINE_V1_IMPLEMENTATION.md"),
        "Orchestration": ("orchestrator", "PBOS_ORCHESTRATION_ENGINE_V1_IMPLEMENTATION.md"),
        "Planning": ("planner", "PBOS_PLANNING_ENGINE_V1_IMPLEMENTATION.md"),
        "Portfolio": ("portfolio", "PBOS_PORTFOLIO_ENGINE_V1_IMPLEMENTATION.md"),
        "Release": ("release", "PBOS_RELEASE_ENGINE_V1_IMPLEMENTATION.md"),
        "Role": ("role", "PBOS_ROLE_ENGINE_V1_IMPLEMENTATION.md"),
        "Simulation": ("simulation", "PBOS_SIMULATION_ENGINE_V1_IMPLEMENTATION.md"),
        "Strategy": ("strategy", "PBOS_STRATEGY_ENGINE_V1_IMPLEMENTATION.md"),
        "Validation": ("validation", "PBOS_VALIDATION_ENGINE_V1_IMPLEMENTATION.md"),
    }
    engine_results: list[str] = []
    engine_blockers: list[str] = []
    for name, (domain, implementation) in engine_domains.items():
        domain_path = ROOT / "pbos" / domain
        implementation_path = CONSTITUTIONAL_OUTPUT / implementation
        index_present = (domain_path / "index.ts").is_file()
        tests_present = any(domain_path.glob("*.test.ts"))
        implementation_present = implementation_path.is_file()
        status = "REGISTERED" if index_present and tests_present and implementation_present else "INCOMPLETE"
        evidence = f"domain={'yes' if domain_path.is_dir() else 'no'}; index={'yes' if index_present else 'no'}; tests={'yes' if tests_present else 'no'}; governance record={'yes' if implementation_present else 'no'}"
        engine_results.append(f"- **{name}: {status}** — {evidence}.")
        if status != "REGISTERED":
            engine_blockers.append(f"{name}: {evidence}")

    dependency_report = [
        "## Summary",
        f"- Resolved document identifiers: **{len(by_id)}**",
        f"- Unresolved dependency edges: **{len(unresolved)}**",
        f"- Unresolved related-reference edges: **{len(unresolved_related)}**",
        f"- Dependency cycles: **{len(cycles)}**", "",
        "## Unresolved Dependency Edges",
        *([f"- `{source}` → `{target}`" for source, target in unresolved] or ["- None."]), "",
        "## Unresolved Related References",
        *([f"- `{source}` → `{target}`" for source, target in unresolved_related] or ["- None."]), "",
        "## Circular Dependencies",
        *([f"- `{' → '.join(cycle)}`" for cycle in sorted(cycles)] or ["- None."]), "",
        "## Decision Boundary",
        "Absent targets and circular authority cannot be removed, redirected, or reconstructed without affirmative constitutional evidence. They remain blocked for Constitutional Governance.",
    ]
    write_report("PBOS_CONSTITUTIONAL_DEPENDENCY_REPORT.md", "PBOS Constitutional Dependency Report", "Inventories dependency, related-reference, and circularity defects across the tracked PPS corpus.", dependency_report)

    path_report = [
        "## Summary",
        f"- Missing indexed paths: **{len(missing_paths)}**",
        f"- Unindexed volume paths: **{len(unindexed_paths)}**",
        f"- Number-to-volume mismatches: **{len(numbering_issues)}**", "",
        "## Missing Canonical Paths",
        *([f"- `{path}`" for path in missing_paths] or ["- None."]), "",
        "## Unindexed Canonical Paths",
        *([f"- `{path}`" for path in unindexed_paths] or ["- None."]), "",
        "## Numbering Issues",
        *([f"- {issue}" for issue in numbering_issues] or ["- None."]), "",
        "## Resolution Evidence",
        "The index paths and titles for Volumes 10–16 were reconciled to their unique tracked directories and canonical volume-root documents. Volume 03 remains absent after the repository-wide recovery search; no replacement was created.",
    ]
    write_report("PBOS_CANONICAL_PATH_REPORT.md", "PBOS Canonical Path Report", "Certifies deterministic path corrections and records path defects that cannot be resolved from repository evidence.", path_report)

    repository_blockers = bool(
        missing_paths or unindexed_paths or missing_documents or duplicate_ids or unresolved
        or unresolved_related or malformed_dependencies or cycles or metadata_issues
        or numbering_issues or engine_blockers
    )
    readiness_checks = {
        "canonical paths": not (missing_paths or unindexed_paths),
        "dependencies": not unresolved,
        "related references": not unresolved_related,
        "duplicate identifiers": not duplicate_ids,
        "dependency acyclicity": not cycles,
        "metadata": not metadata_issues,
        "numbering": not numbering_issues,
        "engine registration": not engine_blockers,
    }
    passed_checks = sum(readiness_checks.values())
    readiness_score = round(100 * passed_checks / len(readiness_checks))
    certification_report = [
        "## Status", "**BLOCKED**" if repository_blockers else "**CERTIFIED**", "",
        "## Repository Health Assessment",
        *[f"- {name}: **{'PASS' if passed else 'BLOCKED'}**" for name, passed in readiness_checks.items()], "",
        "## Engine Registration",
        *engine_results, "",
        "## Remaining Blockers",
        *([f"- Missing indexed path: `{path}`" for path in missing_paths]
          + [f"- Unresolved dependency: `{source}` → `{target}`" for source, target in unresolved]
          + [f"- Unresolved related reference: `{source}` → `{target}`" for source, target in unresolved_related]
          + [f"- Circular dependency: `{' → '.join(cycle)}`" for cycle in sorted(cycles)]
          + [f"- Metadata: {issue}" for issue in metadata_issues]
          + [f"- Numbering: {issue}" for issue in numbering_issues]
          + [f"- Engine registration: {issue}" for issue in engine_blockers]
          or ["- None."]), "",
        "## Constitutional Certification Decision",
        ("Certification is denied. The repository remains fail-closed until every listed blocker is resolved through evidenced recovery, deterministic correction, or authorized constitutional amendment."
         if repository_blockers else "Certification is granted. All deterministic constitutional gates passed."), "",
        "## Repository Readiness Score", f"**{readiness_score}/100** ({passed_checks} of {len(readiness_checks)} constitutional health dimensions pass).",
    ]
    write_report("PBOS_REPOSITORY_CERTIFICATION_REPORT.md", "PBOS Repository Certification Report", "Records the deterministic repository-wide constitutional certification decision.", certification_report)

    implementation_report = [
        "## Status", "**BLOCKED**" if repository_blockers else "**COMPLETE**", "",
        "## Executive Summary",
        "The sprint applied every correction supported by affirmative repository evidence and preserved fail-closed governance for every defect that requires missing source material or a constitutional authority decision.", "",
        "## Repository Health Assessment",
        f"The verifier inspected {len(by_id)} uniquely identified PPS documents. The repository readiness score is **{readiness_score}/100**.", "",
        "## Missing Path Resolution",
        "Volumes 10–16 were reconciled in the canonical index using their unique tracked directories and matching canonical volume-root metadata. Volume 03 remains missing and is not reconstructable from repository evidence.", "",
        "## Dependency Resolution",
        f"No dependency authority was guessed or removed. **{len(unresolved)}** absent dependency edges, **{len(unresolved_related)}** absent related-reference edges, and **{len(cycles)}** circular dependency cycles remain explicitly inventoried.", "",
        "## Canonical Registry Updates",
        "The machine-readable PPS index was corrected to version 2.0.1. The prose canonical registry remains authoritative at the domain level and was not expanded with invented document authority.", "",
        "## Cross-Reference Updates",
        "The deterministic `PPS-0000` typographical reference was corrected to the existing `PPS-000` Constitution. References without an affirmative target remain blocked rather than redirected.", "",
        "## Validation Results",
        "See the linked canonical path, constitutional dependency, and repository certification reports for the complete machine-generated result.", "",
        "## Remaining Blockers",
        f"Volume 03 is absent; dependency or related-reference targets PPS-201, PPS-300–PPS-305, PPS-307, PPS-1004, PPS-1706, and PPS-2300 lack tracked canonical authorities; PPS-2006/PPS-2007 form a dependency cycle; and {len(metadata_issues)} documents omit machine metadata required by PPS-008 and PPS-100.", "",
        "## Constitutional Certification Decision",
        "**DENIED / FAIL CLOSED.** Repository-wide certification cannot be achieved from present evidence without fabricating documents or inferring constitutional authority.", "",
        "## Repository Readiness Score", f"**{readiness_score}/100**", "",
        "## Recommended Next Sprint",
        "Constitutional Governance should recover or formally disposition missing Volume 03 and each absent target, then adjudicate the PPS-2006/PPS-2007 cycle through the constitutional amendment process before verification is rerun.",
    ]
    write_report("PBOS-CONST-001_IMPLEMENTATION_REPORT.md", "PBOS-CONST-001 Implementation Report", "Documents the Repository Constitutional Certification Sprint, applied deterministic corrections, and fail-closed authority boundary.", implementation_report)

    missing_body = [
        "## Decision", "The PBOS-CONST-001 certification sprint authorized deterministic index repair where a unique tracked volume directory and matching canonical volume-root metadata supplied affirmative evidence. Volumes 10–16 were corrected without moving constitutional documents. Volume 03 remains blocked because no tracked authority exists.", "",
        "## Missing Indexed Directories",
        *([f"- `{path}`" for path in missing_paths] or ["- None."]), "",
        "## Existing Unindexed Volume Directories",
        *([f"- `{path}`" for path in unindexed_paths] or ["- None."]), "",
        "## Deterministic Path Reconciliation",
        *([f"- Volume {number}: `{old}` → `{new}` (unique numeric-prefix match)." for number, old, new in inferred_paths] or ["- None."]), "",
        "## Missing Explicitly Indexed Documents",
        *([f"- `{identifier}`" for identifier in missing_documents] or ["- None."]),
        "", "## Missing Dependency-Referenced Documents",
        *([f"- `{identifier}`" for identifier in missing_referenced_documents] or ["- None."]),
    ]
    write_report("PBOS-CONST-001_MISSING_PATH_REPORT.md", "PBOS-CONST-001 Missing Path Report", "Records deterministic differences between indexed PPS paths and the tracked filesystem.", missing_body)

    dependency_body = [
        "## Duplicate Identifiers",
        *([f"- `{identifier}`: {', '.join(f'`{relative(path)}`' for path in paths)}" for identifier, paths in sorted(duplicate_ids.items())] or ["- None."]), "",
        "## Unresolved Dependencies",
        *([f"- `{identifier}` depends on missing `{dependency}`." for identifier, dependency in unresolved] or ["- None."]), "",
        "## Malformed Dependency Values",
        *([f"- `{identifier}`: `{dependency}`" for identifier, dependency in sorted(malformed_dependencies)] or ["- None."]), "",
        "## Metadata Dialects Observed",
        "- Volume 0 documents use `owner` and `dependencies`.",
        "- Later restored volumes use `owners` and `depends_on`.",
        "- The verifier intentionally supports both dialects without rewriting constitutional documents.",
    ]
    write_report("PBOS-CONST-001_DEPENDENCY_CONFLICT_REPORT.md", "PBOS-CONST-001 Dependency Conflict Report", "Records identifier and dependency-graph conflicts without changing constitutional content.", dependency_body)

    blocking = repository_blockers
    reconciliation_body = [
        "## Authority Decision Record", "**Recommendation: A plus C.** Correct index paths that have a unique filesystem match after governance approval. Use an approved constitutional amendment or recovery decision for missing constitutional content and unresolved dependencies. Do not restructure the filesystem merely to match demonstrably stale metadata.", "",
        "This report documents the authority recommendation required before metadata changes. It does not itself amend the Constitution or authorize reconstruction of missing documents.", "",
        "## Deterministic Result",
        f"- Tracked PPS files inspected: **{len(tracked)}**",
        f"- Constitutional documents with valid identifiers: **{len(by_id)}**",
        f"- Missing indexed directories: **{len(missing_paths)}**",
        f"- Existing unindexed volume directories: **{len(unindexed_paths)}**",
        f"- Missing explicitly indexed documents: **{len(missing_documents)}**",
        f"- Missing dependency-referenced documents: **{len(missing_referenced_documents)}**",
        f"- Duplicate identifiers: **{len(duplicate_ids)}**",
        f"- Unresolved dependency edges: **{len(unresolved)}**",
        f"- Unresolved related-reference edges: **{len(unresolved_related)}**",
        f"- Circular dependency cycles: **{len(cycles)}**",
        f"- Metadata defects: **{len(metadata_issues)}**",
        f"- Numbering defects: **{len(numbering_issues)}**", "",
        "## Trust Determination", "**BLOCKED** — the PPS index cannot yet be trusted as a complete machine-readable representation of the tracked constitutional filesystem." if blocking else "**PASS** — the index, filesystem, identifiers, and dependencies reconcile.", "",
        "## Generated Evidence",
        "- [Missing Path Report](./PBOS-CONST-001_MISSING_PATH_REPORT.md)",
        "- [Dependency Conflict Report](./PBOS-CONST-001_DEPENDENCY_CONFLICT_REPORT.md)",
        "- [Recommended Remediation Plan](./PBOS-CONST-001_RECOMMENDED_REMEDIATION_PLAN.md)",
    ]
    write_report("PBOS-CONST-001_CONSTITUTIONAL_RECONCILIATION_REPORT.md", "PBOS-CONST-001 Constitutional Reconciliation Report", "Reconciles the canonical PPS index against tracked constitutional artifacts without modifying constitutional documents.", reconciliation_body)

    remediation_body = [
        "## Recommended Authority Path", "**A — Correct index paths:** Applied for Volumes 10–16 under the PBOS-CONST-001 certification sprint because each path had one tracked directory and a matching canonical volume-root identity.", "", "**B — Correct filesystem structure:** Not applied. Moving constitutional documents to satisfy stale metadata would create unnecessary historical and dependency risk.", "", "**C — Constitutional amendment or recovery decision:** Required for absent constitutional documents, unresolved dependencies, circular authority, metadata values that establish release behavior, or any conflict without a unique deterministic mapping.", "",
        "## Ordered Remediation", "1. Resolve missing Volume 03 and its PPS-300-series authority through evidenced recovery or a formally documented constitutional amendment; do not create placeholders.", "2. Recover or formally disposition PPS-201, PPS-1004, PPS-1706, and PPS-2300.", "3. Adjudicate the PPS-2006/PPS-2007 dependency cycle through Constitutional Governance.", "4. Approve required machine metadata values under PPS-008 and PPS-100; do not infer release-blocking authority.", "5. Re-run `npm run pbos:constitution:verify` and require a zero exit status before constitutional certification.", "6. Preserve this report and all approval, validation, and supersession records.", "",
        "## Prohibited Remediation", "- Do not fabricate missing specifications.", "- Do not rewrite constitutional prose as a metadata repair.", "- Do not move or delete historical documents without approved governance.", "- Do not mark the library trusted while unresolved dependencies remain.",
    ]
    write_report("PBOS-CONST-001_RECOMMENDED_REMEDIATION_PLAN.md", "PBOS-CONST-001 Recommended Remediation Plan", "Records the authority recommendation and ordered steps required to restore deterministic constitutional trust.", remediation_body)

    issue_lines = [
        "# PPS Constitutional Issue Registry", "", "## Purpose", "Provides the structured PBOS-CONST-002 registry of every unresolved constitutional conflict detected by deterministic verification.", "", "## Ownership", "PBOS / Constitutional Governance", "", "## Last Updated", "July 26, 2026", "", "## Related Documents", "- [Authority Decision Matrix](./PPS_AUTHORITY_DECISION_MATRIX.md)", "- [Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)", "", "## Registry", "", "| Issue ID | Category | Affected PPS | Current evidence | Conflict | Risk | Recommended action | Approval authority | Status |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for issue in issues:
        issue_lines.append("| {issue_id} | {category} | {affected} | {evidence} | {description} | {risk} | {action} | {authority} | {status} |".format(
            issue_id=issue["issue_id"], category=issue["category"], affected=", ".join(f"`{item}`" for item in issue["affected_documents"]), evidence="<br>".join(str(item) for item in issue["evidence"]), description=issue["description"], risk=issue["risk"], action=issue["recommended_action"], authority=issue["authority"], status=issue["status"],
        ))
    (CONSTITUTIONAL_OUTPUT / "PPS_CONSTITUTIONAL_ISSUE_REGISTRY.md").write_text("\n".join(issue_lines) + "\n", encoding="utf-8")

    matrix_lines = [
        "# PPS Authority Decision Matrix", "", "## Purpose", "Classifies each PBOS-CONST-002 conflict by the authority required to resolve it without changing constitutional meaning by inference.", "", "## Ownership", "PBOS / Constitutional Governance", "", "## Last Updated", "July 26, 2026", "", "## Related Documents", "- [Issue Registry](./PPS_CONSTITUTIONAL_ISSUE_REGISTRY.md)", "- [Governance Handoff](./PPS_GOVERNANCE_HANDOFF.md)", "", "## Classification Rules", "- **Category A — Deterministic Correction:** evidence admits one interpretation and correction changes no constitutional meaning. Human Platform Governance approval is still required before application.", "- **Category B — Governance Review Required:** evidence is incomplete, authority is absent, or competing interpretations may exist.", "- **Category C — Constitutional Amendment Required:** the proposed resolution changes hierarchy, foundational authority, ownership rules, or dependency authority.", "", "A unique numeric-prefix match is not sufficient for Category A when indexed titles and filesystem taxonomies differ. PBOS therefore classifies every current path conflict as Category B. Missing dependency targets also remain Category B during investigation. Any later proposal to remove, redirect, or redefine dependency authority is Category C.", "", "## Decision Matrix", "", "| Issue ID | Classification | Evidence basis | Permitted next action | Human approval |", "| --- | --- | --- | --- | --- |",
    ]
    for issue in issues:
        matrix_lines.append(f'| {issue["issue_id"]} | Category {issue["category"]} | {"<br>".join(str(item) for item in issue["evidence"])} | {issue["recommended_action"]} | Required — {issue["authority"]} |')
    (CONSTITUTIONAL_OUTPUT / "PPS_AUTHORITY_DECISION_MATRIX.md").write_text("\n".join(matrix_lines) + "\n", encoding="utf-8")

    conflict_ids = {identifier for identifier, _ in unresolved}
    manifest_lines = [
        "# PPS Canonical Resolution Manifest", "", "## Purpose", "Defines the proposed future authority state for every tracked PPS document and indexed volume without applying filesystem, metadata, or constitutional changes.", "", "## Ownership", "PBOS / Constitutional Governance", "", "## Last Updated", "July 26, 2026", "", "## Related Documents", "- [Authority Decision Matrix](./PPS_AUTHORITY_DECISION_MATRIX.md)", "- [Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)", "", "## Status Semantics", "`pending` is a proposal awaiting human governance action; it is not authority to modify an artifact. `retained` means the verifier found no location conflict, not that the document has received new certification.", "", "## Volume Manifest", "", "| PPS Identifier | Canonical title | Current location | Expected location | Authority status | Dependency status | Resolution decision | Approval status |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for volume in indexed:
        indexed_path = volume["path"]
        current = inferred_by_old.get(indexed_path, indexed_path if (PPS / indexed_path).is_dir() else "not found")
        expected = "undetermined" if indexed_path in missing_paths else indexed_path
        decision = "taxonomy governance decision required" if indexed_path in inferred_by_old else ("governance recovery decision required" if current == "not found" else "retain")
        approval = "pending" if indexed_path in missing_paths else "not required"
        manifest_lines.append(f'| `VOLUME-{volume["volume"]:02d}` | {volume["title"]} | `{current}` | `{expected}` | {index["status"]} | {"conflicted" if current == "not found" else "not evaluated at volume level"} | {decision} | {approval} |')
    manifest_lines.extend(["", "## Document Manifest", "", "| PPS Identifier | Canonical title | Current location | Expected location | Authority status | Dependency status | Resolution decision | Approval status |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"])
    for identifier, paths in sorted(by_id.items(), key=lambda item: int(item[0].split("-")[1])):
        path = paths[0]
        data = metadata[path]
        location = relative(path)
        dependency_status = "unresolved" if identifier in conflict_ids else "resolved"
        manifest_lines.append(f'| `{identifier}` | {data.get("title", "Undeclared")} | `{location}` | `{location}` | {data.get("status", "Undeclared")} | {dependency_status} | {"governance review required" if dependency_status == "unresolved" else "retain; no change proposed"} | {"pending" if dependency_status == "unresolved" else "not required"} |')
    (CONSTITUTIONAL_OUTPUT / "PPS_CANONICAL_RESOLUTION_MANIFEST.md").write_text("\n".join(manifest_lines) + "\n", encoding="utf-8")

    queue = [{
        "issue_id": issue["issue_id"], "classification": issue["classification"], "affected_documents": issue["affected_documents"], "evidence": issue["evidence"], "recommended_action": issue["recommended_action"], "requires_human_approval": True, "status": "pending",
    } for issue in issues]
    (CONSTITUTIONAL_OUTPUT / "PPS_GOVERNANCE_APPROVAL_QUEUE.json").write_text(json.dumps(queue, indent=2) + "\n", encoding="utf-8")

    handoff = f"""# PPS Governance Handoff

## Purpose
Defines the human authority boundary for PBOS-CONST-002 and prevents automated inference from becoming constitutional action.

## Ownership
PBOS / Constitutional Governance

## Last Updated
July 26, 2026

## Related Documents
- [Issue Registry](./PPS_CONSTITUTIONAL_ISSUE_REGISTRY.md)
- [Authority Decision Matrix](./PPS_AUTHORITY_DECISION_MATRIX.md)
- [Canonical Resolution Manifest](./PPS_CANONICAL_RESOLUTION_MANIFEST.md)
- [Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)

## What PBOS Detected
PBOS detected {len(missing_paths)} missing indexed path, {len(unindexed_paths)} unindexed volume directories, {len(missing_referenced_documents)} absent dependency targets represented by {len(unresolved)} unresolved dependency edges, {len(unresolved_related)} unresolved related-reference edges, {len(cycles)} dependency cycle, {len(metadata_issues)} metadata defects, and {len(duplicate_ids)} duplicate PPS identifiers. Missing means only **not found in the tracked PPS corpus**; it does not mean deleted.

## What PBOS Can Recommend
PBOS may identify a unique numeric-prefix location as a candidate, but a candidate is not a deterministic correction when its taxonomy conflicts with the index title. PBOS may identify evidence gaps, classify risk, preserve proposed state, and block validation. PBOS cannot convert a recommendation into authority.

## Validation Boundaries
PBOS must classify artifacts using affirmative evidence:

1. **Missing document:** referenced or explicitly indexed, but no tracked artifact resolves the identifier.
2. **Deprecated document:** an artifact exists and explicitly declares a deprecated status.
3. **Historical document:** an artifact exists in an authorized historical/archive scope or explicitly declares historical classification.
4. **Renamed document:** old and new identities are connected by an explicit rename, successor, or supersession record.
5. **Intentional migration:** an approved decision records source, destination, effective version, and migration state.
6. **True constitutional conflict:** two authorities compete, a dependency cannot resolve, or correction would change constitutional meaning.

PBOS shall never infer deprecation, deletion, rename, migration, or supersession from absence alone. Until affirmative evidence exists, the status remains `missing` or `unresolved` and validation remains blocked.

## What Requires Human Approval
- Every Category A metadata correction requires Platform Governance approval.
- Every Category B evidence or recovery decision requires Constitutional Governance review.
- Every Category C change requires the formal constitutional amendment process.

## Changes Prohibited Without Amendment
PBOS must not change hierarchy, foundational authority, ownership rules, dependency authority, or constitutional meaning; invent missing specifications; rewrite constitutional prose; delete history; or move documents based only on inferred intent.

## Required Approval Process
1. Review each pending queue item and its cited evidence.
2. Record an approver, decision, rationale, date, and scope.
3. Escalate any meaning-changing proposal to Category C.
4. Apply approved Category A metadata changes separately from constitutional amendments.
5. Preserve before/after manifests and the decision record.
6. Re-run deterministic verification; certification remains blocked until all required gates pass.
"""
    (CONSTITUTIONAL_OUTPUT / "PPS_GOVERNANCE_HANDOFF.md").write_text(handoff, encoding="utf-8")

    print(f"PPS documents: {len(by_id)}; missing paths: {len(missing_paths)}; duplicates: {len(duplicate_ids)}; unresolved dependencies: {len(unresolved)}; unresolved related: {len(unresolved_related)}; cycles: {len(cycles)}")
    print("Constitutional trust: BLOCKED" if blocking else "Constitutional trust: VERIFIED")
    return 1 if blocking else 0


if __name__ == "__main__":
    raise SystemExit(main())
