import { PBOSEngine } from "./types";

export abstract class BaseEngine
  implements PBOSEngine {

  abstract id: string;

  abstract name: string;

  abstract phase:
    | "observe"
    | "understand"
    | "reason"
    | "plan"
    | "validate"
    | "execute"
    | "verify"
    | "learn";

  enabled = true;

  dependsOn: string[] = [];

  abstract run(world: any): any;

}
