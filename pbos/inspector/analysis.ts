import fs from "fs";

import { RepositoryAnalysis } from "./types";

import { scanRepository } from "./scanner";

export function analyzeRepository(
  root: string
): RepositoryAnalysis {

  const files = scanRepository(root);

  const analysis: RepositoryAnalysis = {

    scannedAt: new Date().toISOString(),

    filesScanned: files.length,

    directoriesScanned: 0,

    todos: [],

    fixmes: [],

    missingFiles: [],

    emptyDirectories: [],

    score: 100,

  };

  for (const file of files) {

    const text = fs.readFileSync(file,"utf8");

    if (text.includes("TODO")) {

      analysis.todos.push({
        type:"TODO",
        severity:"medium",
        file,
        message:"Contains TODO"
      });

    }

    if (text.includes("FIXME")) {

      analysis.fixmes.push({
        type:"FIXME",
        severity:"high",
        file,
        message:"Contains FIXME"
      });

    }

  }

  analysis.score -= analysis.todos.length;

  analysis.score -= analysis.fixmes.length * 2;

  return analysis;

}
