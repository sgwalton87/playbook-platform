#!/usr/bin/env node

import { next } from "./commands/next.mjs";
import { start } from "./commands/start.mjs";
import { verify } from "./commands/verify.mjs";
import { complete } from "./commands/complete.mjs";
import { resume } from "./commands/resume.mjs";
import { doctor } from "./commands/doctor.mjs";

const cmd = process.argv[2] || "next";

switch (cmd) {
  case "next":
    await next();
    break;

  case "start":
    await start();
    break;

  case "verify":
    await verify();
    break;

  case "complete":
    await complete();
    break;

  case "resume":
    await resume();
    break;

  case "doctor":
    await doctor();
    break;

  default:
    console.log(`Unknown command: ${cmd}`);
}