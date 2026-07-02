#!/usr/bin/env python3

from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime

ROOT = Path.cwd()
BACKUP_DIR = ROOT / ".playbook-backups"

def log(msg):
    print(msg)

def run(cmd):
    return subprocess.run(cmd, shell=True)

def backup(file_path):
    path = ROOT / file_path
    if not path.exists():
        raise SystemExit(f"❌ File not found: {file_path}")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = BACKUP_DIR / f"{stamp}_{path.name}"
    shutil.copy2(path, dest)
    log(f"✅ Backup created: {dest}")

def build():
    log("🚀 Running Playbook build...")
    result = run("bash scripts/build.sh")
    sys.exit(result.returncode)

def doctor():
    log("🩺 Running Playbook doctor...")
    result = run("bash scripts/doctor.sh")
    sys.exit(result.returncode)

def create_portfolio_engine():
    log("🎓 Creating Portfolio Engine...")

    folders = [
        "lib/portfolio",
        "lib/portfolio/services",
        "lib/portfolio/types",
        "lib/portfolio/events",
        "lib/portfolio/documents",
        "lib/portfolio/ai",
    ]

    for folder in folders:
        (ROOT / folder).mkdir(parents=True, exist_ok=True)

    files = {
        "lib/portfolio/index.ts": """export * from "./types";
export * from "./events";
""",

        "lib/portfolio/types.ts": """export type PortfolioRole =
  | "scholar"
  | "scholar_athlete"
  | "parent"
  | "mentor"
  | "coach"
  | "educator"
  | "admin"
  | "founder";

export interface PortfolioIdentity {
  id: string;
  username?: string | null;
  role?: PortfolioRole | string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  school?: string | null;
  city?: string | null;
  state?: string | null;
  grade?: string | null;
  graduationYear?: string | null;
}

export interface PortfolioAcademics {
  weightedGpa?: string | null;
  unweightedGpa?: string | null;
  dreamSchool?: string | null;
  intendedMajor?: string | null;
  satScore?: string | null;
  actScore?: string | null;
}

export interface PortfolioCareer {
  idealProfession?: string | null;
  desiredSalaryRange?: string | null;
}

export interface PortfolioAthletics {
  sport?: string | null;
  position?: string | null;
  height?: string | null;
  weight?: string | null;
  travelTeam?: string | null;
  coachName?: string | null;
  coachEmail?: string | null;
  recruitingStatus?: string | null;
  highlightVideo?: string | null;
}

export interface Portfolio {
  identity: PortfolioIdentity;
  academics: PortfolioAcademics;
  career: PortfolioCareer;
  athletics?: PortfolioAthletics;
  pillars: string[];
}
""",

        "lib/portfolio/events.ts": """export type PortfolioEventType =
  | "ProfileCreated"
  | "PortfolioUpdated"
  | "CourseCompleted"
  | "CertificateIssued"
  | "BadgeEarned"
  | "ActivityAdded"
  | "LeadershipVerified"
  | "RecommendationRequested"
  | "RecommendationApproved"
  | "ResumeGenerated"
  | "OpportunityMatched";

export interface PortfolioEvent {
  id?: string;
  scholarId: string;
  type: PortfolioEventType;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}
""",

        "lib/portfolio/services/profile.ts": """import { Portfolio } from "../types";

export function mapProfileToPortfolio(profile: any): Portfolio {
  return {
    identity: {
      id: profile.id,
      username: profile.username,
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" "),
      avatarUrl: profile.avatar_url,
      bannerUrl: profile.banner_url,
      bio: profile.bio,
      school: profile.school,
      city: profile.city,
      state: profile.state,
      grade: profile.grade,
      graduationYear: profile.grad_year,
    },
    academics: {
      weightedGpa: profile.weighted_gpa || profile.gpa,
      unweightedGpa: profile.unweighted_gpa,
      dreamSchool: profile.dream_school,
      intendedMajor: profile.intended_major,
      satScore: profile.sat_score,
      actScore: profile.act_score,
    },
    career: {
      idealProfession: profile.ideal_profession,
      desiredSalaryRange: profile.desired_salary_range,
    },
    athletics: {
      sport: profile.sport,
      position: profile.position,
      height: profile.height,
      weight: profile.weight,
      travelTeam: profile.travel_team,
      coachName: profile.coach_name,
      coachEmail: profile.coach_email,
      recruitingStatus: profile.recruiting_status || profile.recruiting_interest,
      highlightVideo: profile.highlight_video || profile.highlight_reel_url,
    },
    pillars: profile.pillars || [],
  };
}
""",

        "lib/portfolio/services/academic.ts": """export function calculateAcademicCompletion(portfolio: any): number {
  const fields = [
    portfolio?.academics?.weightedGpa,
    portfolio?.academics?.unweightedGpa,
    portfolio?.academics?.dreamSchool,
    portfolio?.academics?.intendedMajor,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}
""",

        "lib/portfolio/services/achievement.ts": """export function getAchievementSummary({ certificates = [], badges = [], activities = [] }: any) {
  return {
    certificateCount: certificates.length,
    badgeCount: badges.length,
    activityCount: activities.length,
  };
}
""",

        "lib/portfolio/services/timeline.ts": """import { PortfolioEvent } from "../events";

export function sortTimeline(events: PortfolioEvent[]) {
  return [...events].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}
""",

        "lib/portfolio/services/resume.ts": """export function generateResumeDraft(portfolio: any) {
  return {
    name: portfolio?.identity?.fullName || "Scholar",
    headline: portfolio?.career?.idealProfession || "Emerging Scholar",
    education: portfolio?.identity?.school || "",
    dreamSchool: portfolio?.academics?.dreamSchool || "",
    skills: portfolio?.pillars || [],
  };
}
""",

        "lib/portfolio/services/recommendation.ts": """export function createRecommendationContext(portfolio: any) {
  return {
    scholarName: portfolio?.identity?.fullName || "Scholar",
    school: portfolio?.identity?.school,
    careerGoal: portfolio?.career?.idealProfession,
    dreamSchool: portfolio?.academics?.dreamSchool,
    pillars: portfolio?.pillars || [],
  };
}
""",

        "lib/portfolio/services/opportunity.ts": """export function getOpportunitySignals(portfolio: any) {
  return {
    careerGoal: portfolio?.career?.idealProfession,
    dreamSchool: portfolio?.academics?.dreamSchool,
    grade: portfolio?.identity?.grade,
    pillars: portfolio?.pillars || [],
  };
}
""",

        "lib/portfolio/services/verification.ts": """export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export function isVerified(status?: VerificationStatus) {
  return status === "verified";
}
""",

        "lib/portfolio/services/skills.ts": """export function skillsFromPillars(pillars: string[] = []) {
  return pillars.map((pillar) => ({
    name: pillar,
    source: "Playbook Pillar",
  }));
}
""",

        "lib/portfolio/services/ai.ts": """export function buildPortfolioAIContext(portfolio: any) {
  return {
    identity: portfolio.identity,
    academics: portfolio.academics,
    career: portfolio.career,
    athletics: portfolio.athletics,
    pillars: portfolio.pillars,
  };
}
""",
    }

    for filename, content in files.items():
        path = ROOT / filename
        if path.exists() and path.read_text().strip():
            log(f"ℹ️ Skipped existing file: {filename}")
            continue
        path.write_text(content)
        log(f"✅ Created {filename}")

    log("🎓 Portfolio Engine scaffold complete.")

def help_text():
    print("""
Playbook Builder

Commands:
  python3 scripts/playbook.py build
  python3 scripts/playbook.py doctor
  python3 scripts/playbook.py backup <file>
  python3 scripts/playbook.py engine portfolio
""")

def main():
    args = sys.argv[1:]

    if not args:
        help_text()
        return

    if args[0] == "build":
        build()

    elif args[0] == "doctor":
        doctor()

    elif args[0] == "backup":
        if len(args) < 2:
            raise SystemExit("Usage: python3 scripts/playbook.py backup <file>")
        backup(args[1])

    elif args[0] == "engine" and len(args) > 1 and args[1] == "portfolio":
        create_portfolio_engine()

    else:
        help_text()

if __name__ == "__main__":
    main()
