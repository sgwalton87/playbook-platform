export function discoverEngines(
  files: string[]
) {

  return files.filter(file =>
    file.startsWith("pbos/") &&
    file.endsWith("index.ts")
  );

}
