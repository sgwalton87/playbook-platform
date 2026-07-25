export interface EngineDefinition {
  id: string;
  name: string;
  version: string;
  order: number;
  enabled: boolean;
  dependsOn: string[];
  produces: string[];
  run: () => void;
}
