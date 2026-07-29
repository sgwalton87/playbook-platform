import type {
  InterfaceMeasurementSignal,
  ScannedInterfaceFile,
} from "./measurement-types";

export interface SignalDefinition {
  id: string;
  description: string;
  pathPattern?: RegExp;
  contentPattern?: RegExp;
}

export function collectSignal(
  definition: SignalDefinition,
  files: ScannedInterfaceFile[]
): InterfaceMeasurementSignal {
  const evidence = files
    .filter(
      (file) =>
        (definition.pathPattern?.test(file.path) ?? false) ||
        (definition.contentPattern?.test(file.content) ?? false)
    )
    .map(({ path }) => path);
  return {
    id: definition.id,
    description: definition.description,
    status: evidence.length > 0 ? "observed" : "missing",
    evidence: [...new Set(evidence)].slice(0, 50),
  };
}

export function collectDuplicateComponentNames(
  files: ScannedInterfaceFile[]
): InterfaceMeasurementSignal {
  const componentFiles = files.filter(({ path }) =>
    /(?:^|\/)components\/.*\.tsx$/.test(path)
  );
  const byName = new Map<string, string[]>();
  for (const file of componentFiles) {
    const name = file.path.split("/").at(-1)?.toLowerCase() ?? "";
    byName.set(name, [...(byName.get(name) ?? []), file.path]);
  }
  const duplicates = [...byName.values()]
    .filter((paths) => paths.length > 1)
    .flat();
  return {
    id: "duplicate_component_detection",
    description:
      "Component filenames are scanned for potential duplicate ownership.",
    status: componentFiles.length > 0 ? "observed" : "missing",
    evidence: duplicates.slice(0, 50),
  };
}
