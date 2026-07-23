import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("Next image configuration", () => {
  it("allows production-quality hero rendering", () => {
    expect(nextConfig.images?.qualities).toContain(90);
  });

  it("allows the Playbook hero image host", () => {
    expect(nextConfig.images?.remotePatterns).toContainEqual({
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    });
  });
});
