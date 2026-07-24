#!/usr/bin/env tsx
import { runNext } from "../engine/executor";

runNext(process.cwd(), process.argv[2])
  .then((output) => {
    console.log(output);
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
