# PBOS Human Authorization Gateway

## Purpose

Bind development actions to explicit, auditable human authority.

## Risk Model

`GREEN` covers observation and reporting. `YELLOW` covers code, architecture, or dependency change and requires approval. `RED` covers production, security, migration, financial, or constitutional action and requires independent human approval.

## Contract

Requests bind requester, action, package identity and digest, risk, impact, evidence, and timestamp. Decisions bind approver, reason, expiry, request digest, and decision. Missing evidence, self-approved RED actions, expired decisions, or changed packages fail closed.

## Separation

Authorization cannot certify outcomes or modify constitutional authority. `pbos:authorize` creates no decision without a supplied governed request.
