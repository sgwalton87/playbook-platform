import fs from "fs";

function exists(path: string) {
  return fs.existsSync(path);
}

function countFiles(dir: string) {
  if (!exists(dir)) return 0;

  function walk(path: string): number {
    return fs.readdirSync(path).reduce((total, item) => {
      const full = `${path}/${item}`;
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        if (["node_modules", ".next", ".git"].includes(item)) return total;
        return total + walk(full);
      }

      return total + 1;
    }, 0);
  }

  return walk(dir);
}

export function runSentinel() {
  const checks = [
    {
      name: "Playbook SDK exists",
      passed: exists("lib/playbook/index.ts"),
    },
    {
      name: "Archivist exists",
      passed: exists("lib/archivist/ArchivistEngine.ts"),
    },
    {
      name: "Cartographer exists",
      passed: exists("lib/cartographer/CartographerEngine.ts"),
    },
    {
      name: "Compass exists",
      passed: exists("lib/compass/CompassEngine.ts"),
    },
    {
      name: "Academic Intelligence exists",
      passed: exists("lib/academic-intelligence/index.ts"),
    },
    {
      name: "Opportunity Graph exists",
      passed: exists("lib/opportunity-graph/index.ts"),
    },
    {
      name: "Event Bus exists",
      passed: exists("lib/events/bus.ts"),
    },
    {
      name: "Design System exists",
      passed: exists("docs/DESIGN/PLAYBOOK_DESIGN_SYSTEM.md"),
    },
    {
      name: "Alpha 1.0 snapshot exists",
      passed: exists("docs/ARCHITECTURE/PLAYBOOK_OS_ALPHA_1.md"),
    },
    {
      name: "Current Architecture generated",
      passed: exists("docs/ARCHITECTURE/CURRENT_ARCHITECTURE.md"),
    },
    {
      name: "Tests exist",
      passed: countFiles("tests") > 0,
    },
    {
      name: "Supabase migrations exist",
      passed: countFiles("supabase/migrations") > 0,
    },
  ];

  const passed = checks.filter(check => check.passed).length;
  const failed = checks.length - passed;
  const healthScore = Math.round((passed / checks.length) * 100);

  return {
    healthScore,
    status: failed === 0 ? "healthy" : healthScore >= 80 ? "watch" : "needs_attention",
    passed,
    failed,
    checks,
  };
}
