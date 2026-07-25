export function discoverRoutes(
  files: string[]
) {

  return files.filter(file =>
    file.includes("/app/") &&
    file.endsWith("page.tsx")
  );

}
