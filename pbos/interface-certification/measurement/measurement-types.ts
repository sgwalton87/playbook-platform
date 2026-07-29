import type { InterfaceCertificationDomainId } from "../types";

export type MeasurementSignalStatus = "observed" | "missing";

export interface ScannedInterfaceFile {
  path: string;
  digest: string;
  content: string;
}

export interface InterfaceMeasurementSignal {
  id: string;
  description: string;
  status: MeasurementSignalStatus;
  evidence: string[];
}

export interface InterfaceDomainMeasurement {
  id: InterfaceCertificationDomainId;
  name: string;
  signals: InterfaceMeasurementSignal[];
  findings: string[];
  observedSignals: number;
  requiredSignals: number;
  status: "observed" | "incomplete";
}

export interface InterfaceMeasurementRun {
  runId: string;
  volume: string;
  volumeDigest: string;
  implementation: string;
  implementationDigest: string;
  measuredAt: string;
  owner: "interface-measurement";
  scannerVersion: "1.0.0";
  filesScanned: number;
  domains: Record<
    InterfaceCertificationDomainId,
    InterfaceDomainMeasurement
  >;
  findings: string[];
  measurementComplete: boolean;
  certificationEligible: false;
}

export interface InterfaceMeasurementArtifact
  extends InterfaceMeasurementRun {
  schemaVersion: 1;
  history: InterfaceMeasurementRun[];
}
