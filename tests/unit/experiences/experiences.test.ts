import { describe, expect, it } from "vitest";
import { buildExperienceCollection, translateCertificatesToExperiences } from "@/lib/experiences";
import { buildScholarRecord } from "@/lib/scholar";

describe("Canonical Experiences domain", () => {
  it("normalizes internships, work, entrepreneurship, research, apprenticeships, fellowships, and certifications", () => {
    const experiences = buildExperienceCollection([
      { id: "intern", activity_type: "Internship", activity_name: "Clinic Intern" },
      { id: "work", activity_type: "Work Experience", activity_name: "Barista" },
      { id: "founder", activity_type: "Entrepreneurship", activity_name: "Lawn Care Founder" },
      { id: "research", activity_type: "Research", activity_name: "Lab Assistant" },
      { id: "apprentice", activity_type: "Apprenticeship", activity_name: "Electrician Apprentice" },
      { id: "fellow", activity_type: "Fellowship", activity_name: "Civic Fellow" },
      { id: "cert", kind: "Certification", title: "CPR Certified", source: "certificates" },
    ]);

    expect(experiences.all).toHaveLength(7);
    expect(experiences.internships[0].title).toBe("Clinic Intern");
    expect(experiences.workExperience[0].title).toBe("Barista");
    expect(experiences.entrepreneurship[0].title).toBe("Lawn Care Founder");
    expect(experiences.research[0].title).toBe("Lab Assistant");
    expect(experiences.apprenticeships[0].title).toBe("Electrician Apprentice");
    expect(experiences.fellowships[0].title).toBe("Civic Fellow");
    expect(experiences.certifications[0].verified).toBe(true);
  });

  it("lets ScholarRecord consume ExperienceRecord without breaking legacy community access", () => {
    const record = buildScholarRecord({
      certificates: [{ id: "cert-1", title: "Financial Literacy" }],
      activities: [
        { id: "intern-1", activity_type: "Internship", activity_name: "Clinic Intern", organization: "Health Center" },
      ],
    });

    expect(record.experiences.internships[0].organization).toBe("Health Center");
    expect(record.experiences.certifications[0].title).toBe("Financial Literacy");
    expect(record.community.internships[0].organization).toBe("Health Center");
    expect(record.achievements.activities).toBe(record.community.activities);
  });

  it("translates certificates into canonical experience inputs", () => {
    expect(translateCertificatesToExperiences([{ id: "cpr", name: "CPR" }])[0]).toMatchObject({
      id: "cpr",
      kind: "certification",
      title: "CPR",
      source: "certificates",
      verified: true,
    });
  });
});
