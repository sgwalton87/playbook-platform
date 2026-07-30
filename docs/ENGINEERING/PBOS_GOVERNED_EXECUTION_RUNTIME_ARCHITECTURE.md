# PBOS Governed Execution Runtime Architecture

**Purpose:** Govern the operational lifecycle between authorization and isolated execution.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026

Lifecycle: `REQUESTED -> AUTHORIZED -> ADMITTED -> RUNNING -> VALIDATING -> COMPLETED`. Failure states are `BLOCKED`, `FAILED`, and `ROLLED_BACK`.

Admission requires trusted context, valid package, human approval, dependencies, validation, Kernel admission evidence, evidence capture, and outcome evaluation. State transitions require actor and evidence identities. Completion without execution result and outcome evidence is rejected.

The runtime cannot authorize itself, modify permissions, create capabilities, certify, or bypass the Kernel.
