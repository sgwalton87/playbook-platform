export interface GraphNode {
  id: string;
  dependsOn: string[];
}

export interface GraphValidation {
  valid: boolean;
  errors: string[];
}

export interface GraphResolution {
  executionOrder: string[];
  validation: GraphValidation;
}
