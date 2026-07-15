import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const rawDir = path.join(root, "data", "education", "raw");
const generatedDir = path.join(
  root,
  "data",
  "education",
  "generated"
);

const rawPath = path.join(
  rawDir,
  "california-public-schools.txt"
);

const generatedJsonPath = path.join(
  generatedDir,
  "california-schools.json"
);

const generatedTsPath = path.join(
  root,
  "lib",
  "education",
  "providers",
  "californiaSchools.generated.ts"
);

const sourceUrl =
  "https://www.cde.ca.gov/schooldirectory/report?rid=dl1&tp=txt";

fs.mkdirSync(rawDir, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(path.dirname(generatedTsPath), {
  recursive: true,
});

function tryDownload() {
  if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 1000) {
    console.log("ℹ️ Using existing CDE raw data file.");
    return;
  }

  console.log("⬇️ Attempting to download the official CDE TXT file...");

  try {
    execFileSync(
      "curl",
      [
        "-L",
        "--fail",
        "--silent",
        "--show-error",
        "--retry",
        "2",
        "--output",
        rawPath,
        sourceUrl,
      ],
      { stdio: "inherit" }
    );
  } catch {
    // Remove a partial/captcha HTML response.
    if (fs.existsSync(rawPath)) {
      fs.rmSync(rawPath, { force: true });
    }

    throw new Error(
      [
        "",
        "Automatic CDE download was blocked.",
        "",
        "Download the official TXT file in your browser from:",
        "https://www.cde.ca.gov/ds/si/ds/pubschls.asp",
        "",
        "Choose:",
        "Public Schools and Districts (TXT)",
        "",
        `Then rename/move it to:`,
        rawPath,
        "",
        "After that, run:",
        "npm run education:schools",
      ].join("\n")
    );
  }
}

function detectDelimiter(header) {
  if (header.includes("\t")) return "\t";
  if (header.includes(",")) return ",";
  throw new Error(
    "Could not detect whether the CDE source is tab- or comma-delimited."
  );
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function firstValue(record, keys) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);

    if (
      record[normalized] !== undefined &&
      String(record[normalized]).trim()
    ) {
      return String(record[normalized]).trim();
    }
  }

  return "";
}

function optionId(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

tryDownload();

const raw = fs.readFileSync(rawPath, "utf8");

// Detect bot-protection HTML saved as TXT.
if (
  raw.toLowerCase().includes("<html") ||
  raw.toLowerCase().includes("captcha page") ||
  raw.toLowerCase().includes("validate.perfdrive")
) {
  fs.rmSync(rawPath, { force: true });

  throw new Error(
    [
      "The downloaded file was a bot-protection page, not CDE data.",
      "",
      "Open this page in your browser:",
      "https://www.cde.ca.gov/ds/si/ds/pubschls.asp",
      "",
      "Download Public Schools and Districts (TXT), then save it as:",
      rawPath,
    ].join("\n")
  );
}

const lines = raw
  .split(/\r?\n/)
  .map((line) => line.trimEnd())
  .filter(Boolean);

if (lines.length < 2) {
  throw new Error("The CDE file is empty or unreadable.");
}

const delimiter = detectDelimiter(lines[0]);

const headers = parseDelimitedLine(
  lines[0],
  delimiter
).map(normalizeHeader);

const records = lines.slice(1).map((line) => {
  const values = parseDelimitedLine(line, delimiter);
  const record = {};

  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });

  return record;
});

const schools = records
  .map((record) => {
    const cdsCode = firstValue(record, [
      "CDSCode",
      "CDS Code",
    ]);

    const status = firstValue(record, [
      "StatusType",
      "Status Type",
      "Status",
    ]);

    const school = firstValue(record, [
      "School",
      "SchoolName",
      "School Name",
    ]);

    const district = firstValue(record, [
      "District",
      "DistrictName",
      "District Name",
    ]);

    const county = firstValue(record, ["County"]);
    const city = firstValue(record, ["City"]);
    const state = firstValue(record, ["State"]) || "CA";
    const ncesDistrict = firstValue(record, ["NCESDist"]);
    const ncesSchool = firstValue(record, ["NCESSchool"]);
    const schoolType = firstValue(record, [
      "SOCType",
      "SchoolType",
      "School Type",
    ]);

    return {
      id: cdsCode || optionId(`${school}-${district}-${city}`),
      cdsCode: cdsCode || null,
      label: school,
      value: school,
      district: district || null,
      county: county || null,
      city: city || null,
      state: state || "CA",
      status: status || null,
      schoolType: schoolType || null,
      ncesDistrict: ncesDistrict || null,
      ncesSchool: ncesSchool || null,
      source: "California Department of Education",
    };
  })
  .filter((school) => {
    if (!school.label) return false;

    // District records end in seven zeroes and should not appear
    // in the school selector.
    if (school.cdsCode?.endsWith("0000000")) return false;

    return ["active", "pending"].includes(
      String(school.status || "").toLowerCase()
    );
  });

const uniqueSchools = Array.from(
  new Map(
    schools.map((school) => [
      [
        school.label.toLowerCase(),
        String(school.district || "").toLowerCase(),
        String(school.city || "").toLowerCase(),
      ].join("::"),
      school,
    ])
  ).values()
).sort((a, b) => {
  const byName = a.label.localeCompare(b.label);

  if (byName !== 0) return byName;

  return String(a.city || "").localeCompare(
    String(b.city || "")
  );
});

fs.writeFileSync(
  generatedJsonPath,
  JSON.stringify(uniqueSchools, null, 2) + "\n"
);

const generatedTs = `/* eslint-disable */
/**
 * AUTO-GENERATED FILE.
 *
 * Source:
 * California Department of Education
 * Public Schools and Districts Data File
 *
 * Generated:
 * ${new Date().toISOString()}
 *
 * Do not edit manually.
 */

import type { SchoolOption } from "../types";

export const CALIFORNIA_PUBLIC_SCHOOLS: SchoolOption[] =
  ${JSON.stringify(uniqueSchools, null, 2)};

export const CALIFORNIA_PUBLIC_SCHOOL_COUNT =
  CALIFORNIA_PUBLIC_SCHOOLS.length;
`;

fs.writeFileSync(generatedTsPath, generatedTs);

console.log("");
console.log("✅ California school dataset generated.");
console.log(`✅ Schools: ${uniqueSchools.length}`);
console.log(`✅ JSON: ${generatedJsonPath}`);
console.log(`✅ TypeScript: ${generatedTsPath}`);
