import fs from "fs";
import path from "path";
import {
  renderComponentCatalog,
  renderCurrentArchitecture,
  renderDataModel,
  renderEngineCatalog,
  renderEventCatalog,
  renderOwnershipMap,
  renderRepositoryCatalog,
  renderSystemMap,
} from "./ArchitectureRenderer";

function write(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function runCartographer() {
  write("docs/ARCHITECTURE/CURRENT_ARCHITECTURE.md", renderCurrentArchitecture());
  write("docs/ARCHITECTURE/ENGINE_CATALOG.md", renderEngineCatalog());
  write("docs/ARCHITECTURE/REPOSITORY_CATALOG.md", renderRepositoryCatalog());
  write("docs/ARCHITECTURE/EVENT_CATALOG.md", renderEventCatalog());
  write("docs/ARCHITECTURE/COMPONENT_CATALOG.md", renderComponentCatalog());
  write("docs/ARCHITECTURE/SYSTEM_MAP.md", renderSystemMap());
  write("docs/ARCHITECTURE/DATA_MODEL.md", renderDataModel());

  write(
    "docs/ARCHITECTURE/OWNERSHIP_MAP.md",
    renderOwnershipMap()
  );

  return "Cartographer generated architecture documents.";
}
