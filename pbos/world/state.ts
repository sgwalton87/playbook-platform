import fs from "fs";

export function loadRuntimeArtifact(path: string) {

  if (!fs.existsSync(path)) {
    return undefined;
  }

  return JSON.parse(
    fs.readFileSync(path, "utf8")
  );

}
