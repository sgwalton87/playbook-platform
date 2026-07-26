#!/usr/bin/env bash
set -euo pipefail

echo "======================================="
echo " Bootstrapping Playbook PPS Volume 0"
echo "======================================="

mkdir -p docs/PPS
mkdir -p docs/PPS/00_CONSTITUTION

########################################
# README
########################################

cat > docs/PPS/README.md <<'EOF'
# Playbook Platform Specification (PPS)

The Playbook Platform Specification (PPS) is the 
canonical specification library
for the Playbook Platform.

## Volumes

- Volume 0 — Constitution
- Volume 1 — Platform
- Volume 2 — Operating Systems
- Volume 3 — Features
- Volume 4 — Intelligence
- Volume 5 — Data
- Volume 6 — APIs
- Volume 7 — Testing
- Volume 8 — Release

All engineering work shall trace back to one or more PPS 
documents.
EOF

########################################
# VERSION
########################################

cat > docs/PPS/VERSION.md <<'EOF'
# Playbook Platform Specification

Current Version

1.0.0

Status

Canonical

Current Volume

Volume 0 — Constitution

Documents

16 Constitutional Documents

Release Date

2026-07-25
EOF

########################################
# CHANGELOG
########################################

cat > docs/PPS/CHANGELOG.md <<'EOF'
# PPS Changelog

## Version 1.0.0

Initial constitutional release.

Includes:

- PPS-000 Platform Overview
- PPS-001 Mission & Vision
- PPS-002 Platform Principles
- PPS-003 Experience Principles
- PPS-004 Operating System Framework
- PPS-005 Intelligence Constitution
- PPS-006 Intelligence Architecture
- PPS-007 Glossary
- PPS-008 Document Standards
- PPS-009 Identifier Registry
- PPS-010 Dependency Standards
- PPS-011 Data Governance
- PPS-012 Security & Permissions
- PPS-013 Design Language
- PPS-014 Analytics & Observability
- PPS-015 Constitutional Amendment Process
EOF

########################################
# PPS INDEX
########################################

cat > docs/PPS/pps.index.json <<'EOF'
{
  "version": "1.0.0",
  "library": "Playbook Platform Specification",
  "status": "Canonical",
  "currentVolume": "Volume 0 - Constitution",
  "articles": [
    {
      "id": "ARTICLE-I",
      "title": "Platform",
      "documents": [
        "PPS-000",
        "PPS-001",
        "PPS-002"
      ]
    },
    {
      "id": "ARTICLE-II",
      "title": "Experience",
      "documents": [
        "PPS-003",
        "PPS-004"
      ]
    },
    {
      "id": "ARTICLE-III",
      "title": "Intelligence",
      "documents": [
        "PPS-005",
        "PPS-006"
      ]
    },
    {
      "id": "ARTICLE-IV",
      "title": "Governance",
      "documents": [
        "PPS-007",
        "PPS-008",
        "PPS-009",
        "PPS-010",
        "PPS-011",
        "PPS-012",
        "PPS-013",
        "PPS-014"
      ]
    },
    {
      "id": "ARTICLE-V",
      "title": "Constitutional Governance",
      "documents": [
        "PPS-015"
      ]
    }
  ]
}
EOF

echo ""
echo "✅ PPS registry created."
echo ""
echo "Created:"
echo "  docs/PPS/README.md"
echo "  docs/PPS/VERSION.md"
echo "  docs/PPS/CHANGELOG.md"
echo "  docs/PPS/pps.index.json"
echo ""
echo "Next:"
echo "  Populate docs/PPS/00_CONSTITUTION with PPS-000 
through PPS-015."
