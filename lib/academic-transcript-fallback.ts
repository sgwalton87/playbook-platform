export type AgSubjectResult = {
  years_required: number;
  years_completed: number;
  in_progress: boolean;
  courses_taken: string[];
  current_course: string | null;
};

export type AgParseResult = Record<"A" | "B" | "C" | "D" | "E" | "F" | "G", AgSubjectResult>;

const SUBJECTS = {
  A: { required: 2, patterns: [/\b(?:world|u\.?s\.?|american) history\b/gi, /\b(?:government|civics|economics)\b/gi] },
  B: { required: 4, patterns: [/\benglish(?:\s+(?:9|10|11|12|i{1,3}|iv))?\b/gi, /\b(?:literature|composition)\b/gi] },
  C: { required: 3, patterns: [/\b(?:algebra(?:\s+[i12])?|geometry|precalculus|calculus|statistics)\b/gi] },
  D: { required: 2, patterns: [/\b(?:biology|chemistry|physics|earth science|laboratory science)\b/gi] },
  E: { required: 2, patterns: [/\b(?:spanish|french|german|mandarin|chinese|japanese|latin)(?:\s+[i12])?\b/gi] },
  F: { required: 1, patterns: [/\b(?:visual art|studio art|music|theater|theatre|dance)\b/gi] },
  G: { required: 1, patterns: [/\b(?:psychology|sociology|computer science|college preparatory elective)\b/gi] },
} as const;

function extractPdfText(base64: string): string | null {
  try {
    const pdf = Buffer.from(base64, "base64").toString("latin1");
    if (!pdf.startsWith("%PDF-")) return null;
    const strings = [...pdf.matchAll(/\((?:\\.|[^\\)])*\)/g)].map(match =>
      match[0].slice(1, -1).replace(/\\([()\\])/g, "$1")
    );
    const text = strings.join(" ").replace(/\s+/g, " ").trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Provides a deterministic, auditable transcript parser when the configured
 * intelligence provider is unavailable. It intentionally supports text-based
 * PDFs only; scanned/image transcripts still require an approved OCR provider.
 */
export function parseTextPdfTranscript(base64: string, mediaType: string): AgParseResult | null {
  if (mediaType !== "application/pdf") return null;
  const text = extractPdfText(base64);
  if (!text) return null;

  const parsed = {} as AgParseResult;
  for (const [category, configuration] of Object.entries(SUBJECTS) as [keyof AgParseResult, (typeof SUBJECTS)[keyof typeof SUBJECTS]][]) {
    const courses = configuration.patterns.flatMap(pattern => [...text.matchAll(pattern)].map(match => match[0]));
    const uniqueCourses = [...new Set(courses.map(course => course.trim()))];
    parsed[category] = {
      years_required: configuration.required,
      years_completed: Math.min(configuration.required, uniqueCourses.length * 0.5),
      in_progress: false,
      courses_taken: uniqueCourses,
      current_course: null,
    };
  }

  return parsed;
}
