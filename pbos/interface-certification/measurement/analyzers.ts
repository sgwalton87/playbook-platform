import type { InterfaceCertificationDomainId } from "../types";
import {
  collectDuplicateComponentNames,
  collectSignal,
  type SignalDefinition,
} from "./collectors";
import type {
  InterfaceDomainMeasurement,
  ScannedInterfaceFile,
} from "./measurement-types";

const definitions: Record<
  InterfaceCertificationDomainId,
  { name: string; signals: SignalDefinition[] }
> = {
  "IC-001": {
    name: "Design System Compliance",
    signals: [
      {
        id: "component_registry",
        description: "A component registry or manifest is present.",
        pathPattern: /component.*(?:registry|manifest)|(?:registry|manifest).*component/i,
      },
      {
        id: "approved_component_usage",
        description: "Implementation imports shared components.",
        contentPattern: /from\s+["'](?:@\/)?(?:components|lib\/design-system)\//,
      },
      {
        id: "design_system_references",
        description: "Implementation references the design-system boundary.",
        pathPattern: /lib\/design-system\//,
      },
    ],
  },
  "IC-002": {
    name: "Component Architecture Compliance",
    signals: [
      {
        id: "component_ownership",
        description: "Component ownership metadata is present.",
        contentPattern: /(?:owner|ownership)\s*[:=]/i,
      },
      {
        id: "composition_patterns",
        description: "Composition APIs or child composition are present.",
        contentPattern: /(?:children|slot|asChild|compose)/,
      },
      {
        id: "lifecycle_metadata",
        description: "Component lifecycle metadata is present.",
        contentPattern: /(?:deprecated|lifecycle|retired|active)\s*[:=]/i,
      },
      {
        id: "version_references",
        description: "Component version metadata is present.",
        contentPattern: /(?:version|since)\s*[:=]\s*["'][0-9]/i,
      },
    ],
  },
  "IC-003": {
    name: "Design Token Compliance",
    signals: [
      {
        id: "token_usage",
        description: "CSS variables or token APIs are consumed.",
        contentPattern: /(?:var\(--|tokens?\.|theme\.)/,
      },
      {
        id: "hard_coded_style_scan",
        description: "Style-bearing source files were available for audit.",
        contentPattern: /(?:#[0-9a-f]{3,8}\b|\b\d+(?:px|rem|em)\b)/i,
      },
      {
        id: "theme_consistency",
        description: "Theme definitions or theme consumption are present.",
        contentPattern: /(?:ThemeProvider|data-theme|prefers-color-scheme|theme\.)/,
      },
      {
        id: "responsive_token_usage",
        description: "Responsive tokens or media/container queries are present.",
        contentPattern: /(?:@media|@container|breakpoints?\.|screens?\.)/,
      },
    ],
  },
  "IC-004": {
    name: "Accessibility Compliance",
    signals: [
      {
        id: "accessibility_metadata",
        description: "Accessibility labels or descriptions are present.",
        contentPattern: /(?:aria-label|aria-describedby|aria-labelledby)/,
      },
      {
        id: "semantic_structure",
        description: "Semantic landmark or control elements are present.",
        contentPattern: /<(?:main|nav|header|footer|section|button|form)\b/,
      },
      {
        id: "keyboard_requirements",
        description: "Keyboard behavior is implemented or tested.",
        contentPattern: /(?:onKeyDown|onKeyUp|KeyboardEvent|tabIndex)/,
      },
      {
        id: "aria_evidence",
        description: "ARIA state or role evidence is present.",
        contentPattern: /(?:role=|aria-(?:live|expanded|current|invalid|disabled))/,
      },
    ],
  },
  "IC-005": {
    name: "Responsive and Device Compliance",
    signals: [
      {
        id: "responsive_breakpoints",
        description: "Responsive breakpoints or queries are present.",
        contentPattern: /(?:@media|@container|sm:|md:|lg:|xl:)/,
      },
      {
        id: "device_layouts",
        description: "Viewport or device layout handling is present.",
        contentPattern: /(?:viewport|matchMedia|useMediaQuery|orientation)/,
      },
      {
        id: "adaptive_behavior",
        description: "Adaptive layout primitives are present.",
        contentPattern: /(?:minmax\(|auto-fit|auto-fill|clamp\(|container-type)/,
      },
    ],
  },
  "IC-006": {
    name: "Interaction Pattern Compliance",
    signals: [
      {
        id: "navigation_patterns",
        description: "Canonical navigation APIs are consumed.",
        contentPattern: /(?:next\/navigation|next\/link|lib\/navigation)/,
      },
      {
        id: "feedback_patterns",
        description: "Feedback, notification, or progress behavior is present.",
        contentPattern: /(?:toast|alert|progress|status|notification)/i,
      },
      {
        id: "state_transitions",
        description: "Explicit interaction state transitions are present.",
        contentPattern: /(?:useReducer|setState|set[A-Z]\w*\(|transition)/,
      },
    ],
  },
  "IC-007": {
    name: "Interface State Compliance",
    signals: [
      { id: "loading", description: "Loading state exists.", contentPattern: /\bloading\b/i },
      { id: "empty", description: "Empty state exists.", contentPattern: /\bempty\b|no results|no data/i },
      { id: "success", description: "Success state exists.", contentPattern: /\bsuccess\b/i },
      { id: "error", description: "Error state exists.", contentPattern: /\berror\b|failed/i },
      { id: "recovery", description: "Recovery or retry state exists.", contentPattern: /\bretry\b|\brecovery\b|try again/i },
      { id: "permission", description: "Permission state exists.", contentPattern: /\bpermission\b|forbidden|unauthorized/i },
    ],
  },
  "IC-008": {
    name: "Performance and Observability Compliance",
    signals: [
      {
        id: "performance_evidence",
        description: "Performance instrumentation or budgets are present.",
        contentPattern: /(?:performance\.|PerformanceObserver|web-vitals|performance budget)/i,
      },
      {
        id: "analytics_coverage",
        description: "Analytics instrumentation is present.",
        contentPattern: /(?:analytics|trackEvent|capture\()/i,
      },
      {
        id: "monitoring_hooks",
        description: "Monitoring instrumentation is present.",
        contentPattern: /(?:monitoring|telemetry|observability|instrumentation)/i,
      },
      {
        id: "error_tracking",
        description: "Error tracking instrumentation is present.",
        contentPattern: /(?:captureException|error tracking|Sentry|reportError)/i,
      },
    ],
  },
};

export function analyzeInterfaceImplementation(
  files: ScannedInterfaceFile[]
): Record<InterfaceCertificationDomainId, InterfaceDomainMeasurement> {
  return Object.fromEntries(
    Object.entries(definitions).map(([id, definition]) => {
      const signals = definition.signals.map((signal) =>
        collectSignal(signal, files)
      );
      if (id === "IC-001") {
        signals.push(collectDuplicateComponentNames(files));
      }
      const missing = signals.filter(
        ({ status }) => status === "missing"
      );
      const findings = [
        ...missing.map(
          ({ description }) => `No repository signal found: ${description}`
        ),
        "Observed repository signals do not independently prove constitutional compliance.",
      ];
      return [
        id,
        {
          id,
          name: definition.name,
          signals,
          findings,
          observedSignals: signals.length - missing.length,
          requiredSignals: signals.length,
          status:
            missing.length === 0 ? "observed" : "incomplete",
        },
      ];
    })
  ) as Record<
    InterfaceCertificationDomainId,
    InterfaceDomainMeasurement
  >;
}
