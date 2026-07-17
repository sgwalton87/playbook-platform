"use client";

import { useState } from "react";
import CollegeSearch from "@/components/CollegeSearch";
import SearchableSchoolField from "@/components/onboarding/SearchableSchoolField";
import SearchableDistrictField from "@/components/onboarding/SearchableDistrictField";
import SearchableMajorField from "@/components/onboarding/SearchableMajorField";
import SearchableCareerField from "@/components/onboarding/SearchableCareerField";
import ActivityListField from "@/components/onboarding/ActivityListField";
import PriorityListField from "@/components/onboarding/PriorityListField";
import StandardizedTestField from "@/components/onboarding/StandardizedTestField";
import {
  agreeRow,
  chip,
  chipGrid,
  group,
  input,
  label,
  miniGrid,
  primary,
  removeButton,
  safetyBox,
  sectionLabel,
  summaryItem,
  summaryList,
} from "@/components/onboarding/onboardingStyles";

export default function FieldRenderer({
  field,
  value,
  error,
  onChange,
  onBlur,
}: any) {
  const errorMessage = error ? (
    <span
      role="alert"
      style={{
        color: "#B91C1C",
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      {error}
    </span>
  ) : null;

  if (field.type === "school") {
    return (
      <SearchableSchoolField
        fieldKey={field.key}
        label={field.label}
        value={String(value || "")}
        placeholder={field.placeholder}
        required={field.required}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  if (field.type === "district") {
    return (
      <SearchableDistrictField
        fieldKey={field.key}
        label={field.label}
        value={String(value || "")}
        placeholder={field.placeholder}
        required={field.required}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  if (field.type === "major") {
    return (
      <SearchableMajorField
        fieldKey={field.key}
        label={field.label}
        value={String(value || "")}
        placeholder={field.placeholder}
        required={field.required}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  if (field.type === "standardized-test") {
    return (
      <StandardizedTestField
        fieldKey={field.key}
        label={field.label}
        testName={
          field.key === "act_testing"
            ? "ACT"
            : "SAT"
        }
        value={value}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
      />
    );
  }

  if (field.type === "priority-list") {
    return (
      <PriorityListField
        fieldKey={field.key}
        label={field.label}
        value={value}
        options={field.options || []}
        helpText={field.helpText}
        error={error}
        maxSelections={field.maxSelections}
        onChange={onChange}
      />
    );
  }

  if (field.type === "date") {
    return (
      <label
        style={label}
        data-field-key={field.key}
      >
        {field.label}
        {field.required ? (
          <span style={{ color: "#F97316", marginLeft: 4 }}>
            *
          </span>
        ) : null}

        <input
          type="date"
          value={value || ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          style={input}
        />

        {errorMessage}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label style={label} data-field-key={field.key}>
        {field.label}
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{ ...input, minHeight: 120 }}
        />
        {errorMessage}
      </label>
    );
  }


  if (field.type === "safety-agreement") {
    return (
      <div style={group} data-field-key={field.key}>
        <div style={safetyBox}>
          <h3 style={{ marginTop: 0 }}>The Playbook Community Safety Agreement</h3>
          <p>The Playbook is a community built for learning, opportunity, growth, mentorship, and connection. Every member deserves to participate without being bullied, harassed, threatened, humiliated, excluded, or targeted.</p>
          <p>By joining The Playbook, I agree that I will not participate in bullying, harassment, intimidation, discrimination, threats, unwanted sexual conduct, cyberbullying, coordinated targeting, or retaliation in any form.</p>
          <p>This applies to posts, comments, messages, groups, events, courses, mentoring relationships, athletic spaces, and other interactions connected to The Playbook.</p>
          <p>Harmful conduct may include repeated unwanted contact, spreading harmful rumors, sharing private or embarrassing information without permission, encouraging others to target someone, discriminatory harassment, threatening language, or using Playbook features to isolate, shame, or intimidate another person.</p>
          <p>I agree to treat other community members with dignity, report serious safety concerns through the appropriate reporting tools, and cooperate with reasonable safety reviews when necessary.</p>
          <p>I understand that violating this agreement may result in content removal, feature restrictions, temporary suspension, removal from a program or event, or account termination, depending on the circumstances and severity of the conduct.</p>
        </div>

        <label style={agreeRow}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <label style={label} data-field-key={field.key}>
        <span>
          {field.label}
          {field.required ? " *" : ""}
        </span>

        {field.helpText && (
          <small style={{ color: "#64748B", fontWeight: 600 }}>
            {field.helpText}
          </small>
        )}

        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={input}
        >
          <option value="">Choose one...</option>
          {(field.options || []).map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errorMessage}
      </label>
    );
  }

  if (
    field.type === "gpa" ||
    field.type === "graduation-year"
  ) {
    return (
      <label style={label} data-field-key={field.key}>
        <span>
          {field.label}
          {field.required ? " *" : ""}
        </span>

        {field.helpText && (
          <small style={{ color: "#64748B", fontWeight: 600 }}>
            {field.helpText}
          </small>
        )}

        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={input}
          required={Boolean(field.required)}
        >
          <option value="">Choose one...</option>

          {(field.options || []).map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errorMessage}
      </label>
    );
  }

  if (field.type === "assessment-score") {
    return (
      <label style={label} data-field-key={field.key}>
        <span>
          {field.label}
          {field.optional ? " (optional)" : ""}
        </span>

        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "Enter latest score"}
          inputMode="decimal"
          style={input}
        />
        {errorMessage}
      </label>
    );
  }

  if (field.type === "multi-select") {
    const arr = Array.isArray(value) ? value : [];

    return (
      <div style={group} data-field-key={field.key}>
        <div style={sectionLabel}>{field.label}</div>
        {errorMessage}
        <div style={chipGrid}>
          {(field.options || []).map((option: string) => {
            const active = arr.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange(
                    active
                      ? arr.filter((x: string) => x !== option)
                      : [...arr, option]
                  )
                }
                style={chip(active)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "college") {
    return (
      <div
        data-field-key={field.key}
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          marginBottom: 18,
        }}
      >
        <label
          htmlFor={field.key}
          style={{
            display: "block",
            marginBottom: 6,
            color: "#0F172A",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {field.label}
          {field.required ? (
            <span
              style={{
                marginLeft: 4,
                color: "#F97316",
              }}
            >
              *
            </span>
          ) : null}
        </label>

        {field.helpText ? (
          <div
            style={{
              marginBottom: 7,
              color: "#64748B",
              fontSize: 12,
            }}
          >
            {field.helpText}
          </div>
        ) : null}

        <CollegeSearch
          fieldId={field.key}
          value={String(value || "")}
          placeholder={
            field.placeholder ||
            "Start typing a college or university..."
          }
          required={field.required}
          error={error}
          onChange={(
            schoolName: string,
            schoolId?: string
          ) => {
            /*
             * The current onboarding form stores the selected name.
             * CollegeSearch still returns the official ID for screens
             * that maintain a separate ID field.
             */
            onChange(schoolName);
          }}
          onBlur={(schoolName: string) => {
            onBlur?.(schoolName);
          }}
        />
      </div>
    );
  }

  if (field.type === "career") {
    return (
      <SearchableCareerField
        fieldKey={field.key}
        label={field.label}
        value={String(value || "")}
        placeholder={field.placeholder}
        required={field.required}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  if (field.type === "activity-list") {
    return (
      <ActivityListField
        fieldKey={field.key}
        label={field.label}
        value={value}
        helpText={field.helpText}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  }

  if (field.type === "college-list" || field.type === "invite-list") {
    const length = field.type === "college-list" ? 10 : 5;
    const list = field.type === "college-list" ? "college-options" : undefined;
    const arr = Array.isArray(value) ? value : Array(length).fill("");

    return (
      <div style={group} data-field-key={field.key}>
        <div style={sectionLabel}>{field.label}</div>
        {errorMessage}
        <div style={miniGrid}>
          {Array.from({ length }).map((_, i) => (

            field.type==="college-list"

            ?

            <div
              key={i}
              style={{
                position:"relative",
                width:"100%",
                minWidth:0
              }}
            >

              <CollegeSearch
                fieldId={`${field.key}-college-${i + 1}`}
                value={arr[i] || ""}
                placeholder={`${i + 1}. ${field.placeholder}`}
                onChange={(schoolName: string) => {
                  const next = [...arr];
                  next[i] = schoolName;
                  onChange(next);
                }}
                onBlur={(schoolName: string) => {
                  onBlur?.(schoolName);
                }}
              />

            </div>

            :

            <input
              key={i}
              type="email"
              value={arr[i]||""}
              placeholder={`${i+1}. ${field.placeholder}`}
              style={input}
              onChange={(e)=>{
                const next=[...arr];
                next[i]=e.target.value;
                onChange(next);
              }}
            />

          ))}
        </div>
      </div>
    );
  }

  return (
    <label style={label} data-field-key={field.key}>
      {field.label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={input}
      />
    </label>
  );
}
