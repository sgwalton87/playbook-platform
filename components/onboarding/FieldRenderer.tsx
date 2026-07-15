"use client";

import { useState } from "react";
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
    field.type === "graduation-year" ||
    field.type === "major"
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

  if (
    field.type === "school" ||
    field.type === "college" ||
    field.type === "career" ||
    field.type === "district"
  ) {
    const list =
      field.type === "school"
        ? "school-options"
        : field.type === "college"
          ? "college-options"
          : field.type === "career"
            ? "career-options"
            : "district-options";

    return (
      <label style={label} data-field-key={field.key}>
        {field.label}
        <input
          list={list}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder={field.placeholder}
          style={input}
        />
        {errorMessage}
      </label>
    );
  }

  if (field.type === "activity-list") {
    const arr = Array.isArray(value) ? value : [];
    const [draft, setDraft] = useState({
      activity: "",
      category: "",
      description: "",
      hours: "",
      supervisor: "",
    });

    function addActivity() {
      if (!draft.activity.trim()) return;
      onChange([...arr, draft]);
      onBlur?.(draft.activity);
      setDraft({ activity: "", category: "", description: "", hours: "", supervisor: "" });
    }

    return (
      <div style={group} data-field-key={field.key}>
        <div style={sectionLabel}>{field.label}</div>
        {errorMessage}

        <div style={miniGrid}>
          <label style={label} data-field-key={field.key}>
            Activity
            <input
              list="activity-options"
              value={draft.activity}
              onChange={(e) => setDraft({ ...draft, activity: e.target.value })}
              placeholder="Basketball, robotics, job, volunteering..."
              style={input}
            />
          </label>

          <label style={label} data-field-key={field.key}>
            Category
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              style={input}
            >
              <option value="">Choose category...</option>
              {["Sports","Leadership","Arts","Service","Work","STEM","Faith/Community","Family responsibilities","Other"].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>

          <label style={label} data-field-key={field.key}>
            Hours
            <input
              value={draft.hours}
              onChange={(e) => setDraft({ ...draft, hours: e.target.value })}
              placeholder="ex: 25"
              style={input}
            />
          </label>

          <label style={label} data-field-key={field.key}>
            Mentor / Supervisor
            <input
              value={draft.supervisor}
              onChange={(e) => setDraft({ ...draft, supervisor: e.target.value })}
              placeholder="Coach, teacher, manager..."
              style={input}
            />
          </label>
        </div>

        <label style={label} data-field-key={field.key}>
          Description
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="What did you do? What did you learn?"
            style={{ ...input, minHeight: 90 }}
          />
        </label>

        <button type="button" style={primary} onClick={addActivity}>
          Add Entry
        </button>

        <div style={summaryList}>
          {arr.length === 0 ? (
            <p style={{ color: "#64748B", margin: 0 }}>No activity entries added yet.</p>
          ) : (
            arr.map((item: any, i: number) => (
              <div key={`${item.activity}-${i}`} style={summaryItem}>
                <div>
                  <strong>{item.activity}</strong>
                  <div style={{ color: "#64748B", fontSize: 13 }}>
                    {item.category || "Uncategorized"} · {item.hours || "0"} hours · {item.supervisor || "No supervisor listed"}
                  </div>
                  {item.description && <p style={{ margin: "6px 0 0", color: "#475569" }}>{item.description}</p>}
                </div>
                <button
                  type="button"
                  style={removeButton}
                  onClick={() => onChange(arr.filter((_: any, index: number) => index !== i))}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
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
            <input
              key={i}
              list={list}
              type={field.type === "invite-list" ? "email" : "text"}
              value={arr[i] || ""}
              onChange={(e) => {
                const next = [...arr];
                next[i] = e.target.value;
                onChange(next);
              }}
              onBlur={(e) => {
                if (field.type === "college-list") onBlur?.(e.target.value);
              }}
              placeholder={`${i + 1}. ${field.placeholder}`}
              style={input}
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
