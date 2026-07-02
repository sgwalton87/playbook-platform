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


def create_portfolio_assembler():
    log("🎓 Creating Portfolio Assembler...")

    path = ROOT / "lib/portfolio/services/assembler.ts"
    path.parent.mkdir(parents=True, exist_ok=True)

    path.write_text("""import { supabase } from "@/lib/supabaseClient";
import { mapProfileToPortfolio } from "./profile";

export async function getPortfolioByUsername(username: string) {
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error || !profileData) {
    return null;
  }

  const [{ data: certData }, { data: badgeData }, { data: feedData }, { data: activityData }] =
    await Promise.all([
      supabase.from("certificates").select("*").eq("user_id", profileData.id).order("issued_at", { ascending: false }),
      supabase.from("user_badges").select("id,awarded_at,badges(id,name,description,image_url)").eq("user_id", profileData.id).order("awarded_at", { ascending: false }),
      supabase.from("feed_posts").select("*").eq("user_id", profileData.id).or("visibility.eq.public,visibility.is.null").order("created_at", { ascending: false }).limit(50),
      supabase.from("student_activities").select("*").eq("student_id", profileData.id).order("created_at", { ascending: false }),
    ]);

  return {
    rawProfile: profileData,
    portfolio: mapProfileToPortfolio(profileData),
    certificates: certData || [],
    badgeRows: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  };
}
""")

    index = ROOT / "lib/portfolio/index.ts"
    idx = index.read_text()
    if 'export * from "./services/assembler";' not in idx:
        idx += 'export * from "./services/assembler";\n'
        index.write_text(idx)

    log("✅ Portfolio Assembler created.")


def create_portfolio_intelligence():
    log("🧠 Creating Portfolio Intelligence services...")

    files = {
        "lib/portfolio/services/stats.ts": """export function calculatePortfolioStats({ rawProfile, certificates = [], badges = [], posts = [], activities = [] }: any) {
  const xp = Number(rawProfile?.xp ?? 0);
  const coins = Number(rawProfile?.coin_balance ?? 0);

  return {
    xp,
    coins,
    level: Math.max(1, Math.floor(xp / 500) + 1),
    certificateCount: certificates.length,
    badgeCount: badges.length,
    postCount: posts.length,
    activityCount: activities.length,
  };
}
""",
        "lib/portfolio/services/completion.ts": """export function calculatePortfolioCompletion(portfolio: any) {
  const checks = [
    portfolio?.identity?.avatarUrl,
    portfolio?.identity?.bannerUrl,
    portfolio?.identity?.bio,
    portfolio?.identity?.school,
    portfolio?.identity?.grade,
    portfolio?.identity?.graduationYear,
    portfolio?.academics?.weightedGpa || portfolio?.academics?.unweightedGpa,
    portfolio?.academics?.dreamSchool,
    portfolio?.career?.idealProfession,
    portfolio?.career?.desiredSalaryRange,
    (portfolio?.pillars || []).length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  const total = checks.length;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}
""",
        "lib/portfolio/services/dna.ts": """export function calculatePortfolioDNA({ portfolio, certificates = [], activities = [] }: any) {
  const pillars = portfolio?.pillars || [];

  return {
    leadership: score([
      pillars.includes("leadership"),
      activities.some((a: any) => Boolean(a.role_title)),
    ]),
    financialLiteracy: score([
      pillars.includes("finance"),
      certificates.some((c: any) => String(c.course_slug || c.certificate_name || "").toLowerCase().includes("money")),
    ]),
    communityImpact: score([
      pillars.includes("civic"),
      activities.some((a: any) => String(a.activity_type || "").toLowerCase().includes("volunteer")),
    ]),
    wellness: score([pillars.includes("sel")]),
    careerReadiness: score([
      Boolean(portfolio?.career?.idealProfession),
      Boolean(portfolio?.career?.desiredSalaryRange),
    ]),
    collegeReadiness: score([
      Boolean(portfolio?.academics?.dreamSchool),
      Boolean(portfolio?.academics?.weightedGpa || portfolio?.academics?.unweightedGpa),
    ]),
  };
}

function score(values: boolean[]) {
  return values.length ? Math.round((values.filter(Boolean).length / values.length) * 100) : 0;
}
""",
        "lib/portfolio/services/intelligence.ts": """import { calculatePortfolioStats } from "./stats";
import { calculatePortfolioCompletion } from "./completion";
import { calculatePortfolioDNA } from "./dna";

export function buildPortfolioIntelligence(input: any) {
  return {
    stats: calculatePortfolioStats(input),
    completion: calculatePortfolioCompletion(input.portfolio),
    dna: calculatePortfolioDNA(input),
  };
}
""",
    }

    for filename, content in files.items():
        path = ROOT / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        log(f"✅ Created {filename}")

    assembler = ROOT / "lib/portfolio/services/assembler.ts"
    text = assembler.read_text()

    if 'import { buildPortfolioIntelligence } from "./intelligence";' not in text:
        text = text.replace(
            'import { mapProfileToPortfolio } from "./profile";',
            'import { mapProfileToPortfolio } from "./profile";\nimport { buildPortfolioIntelligence } from "./intelligence";'
        )

    old = """  return {
    rawProfile: profileData,
    portfolio: mapProfileToPortfolio(profileData),
    certificates: certData || [],
    badgeRows: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  };"""

    new = """  const portfolio = mapProfileToPortfolio(profileData);

  const intelligence = buildPortfolioIntelligence({
    rawProfile: profileData,
    portfolio,
    certificates: certData || [],
    badges: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  });

  return {
    rawProfile: profileData,
    portfolio,
    intelligence,
    certificates: certData || [],
    badgeRows: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  };"""

    if old in text:
        text = text.replace(old, new)

    assembler.write_text(text)

    index = ROOT / "lib/portfolio/index.ts"
    idx = index.read_text()
    for line in [
        'export * from "./services/stats";',
        'export * from "./services/completion";',
        'export * from "./services/dna";',
        'export * from "./services/intelligence";',
    ]:
        if line not in idx:
            idx += line + "\\n"
    index.write_text(idx)

    log("🧠 Portfolio Intelligence complete.")


def create_scholar_record():
    log("🎓 Creating Scholar Record model...")

    files = {
        "lib/portfolio/scholar-record.ts": """import { buildPortfolioAIContext } from "./services/ai";
import { generateResumeDraft } from "./services/resume";
import { createRecommendationContext } from "./services/recommendation";
import { getOpportunitySignals } from "./services/opportunity";

export function buildScholarRecord(assembled: any) {
  const portfolio = assembled.portfolio;

  return {
    id: portfolio.identity.id,
    rawProfile: assembled.rawProfile,

    portfolio,

    identity: portfolio.identity,
    academics: portfolio.academics,
    career: portfolio.career,
    athletics: portfolio.athletics,
    pillars: portfolio.pillars,

    certificates: assembled.certificates || [],
    badges: assembled.badgeRows || [],
    activities: assembled.activities || [],
    posts: assembled.posts || [],

    intelligence: assembled.intelligence,

    resumeDraft: generateResumeDraft(portfolio),
    recommendationContext: createRecommendationContext(portfolio),
    opportunitySignals: getOpportunitySignals(portfolio),
    aiContext: buildPortfolioAIContext(portfolio),
  };
}
""",
    }

    for filename, content in files.items():
        path = ROOT / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        log(f"✅ Created {filename}")

    assembler = ROOT / "lib/portfolio/services/assembler.ts"
    text = assembler.read_text()

    if 'import { buildScholarRecord } from "../scholar-record";' not in text:
        text = text.replace(
            'import { buildPortfolioIntelligence } from "./intelligence";',
            'import { buildPortfolioIntelligence } from "./intelligence";\nimport { buildScholarRecord } from "../scholar-record";'
        )

    old = """  return {
    rawProfile: profileData,
    portfolio,
    intelligence,
    certificates: certData || [],
    badgeRows: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  };"""

    new = """  const assembled = {
    rawProfile: profileData,
    portfolio,
    intelligence,
    certificates: certData || [],
    badgeRows: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  };

  return {
    ...assembled,
    scholarRecord: buildScholarRecord(assembled),
  };"""

    if old in text:
        text = text.replace(old, new)

    assembler.write_text(text)

    index = ROOT / "lib/portfolio/index.ts"
    idx = index.read_text()
    if 'export * from "./scholar-record";' not in idx:
        idx += 'export * from "./scholar-record";\n'
    index.write_text(idx)

    log("🎓 Scholar Record complete.")

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

    elif args[0] == "patch" and len(args) > 1 and args[1] == "portfolio-assembler":
        create_portfolio_assembler()

    elif args[0] == "patch" and len(args) > 1 and args[1] == "portfolio-intelligence":
        create_portfolio_intelligence()

    elif args[0] == "patch" and len(args) > 1 and args[1] == "scholar-record":
        create_scholar_record()

    else:
        help_text()

if __name__ == "__main__":
    main()
