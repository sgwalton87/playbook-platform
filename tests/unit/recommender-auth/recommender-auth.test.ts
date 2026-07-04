import { describe, expect, it } from "vitest";
import {
  buildRecommenderLoginPath,
  getRecommenderRedirectPath,
  recommenderEmailMatchesRequest,
} from "@/lib/recommender-auth";

describe("Recommender Auth", () => {
  it("builds login path", () => {
    expect(buildRecommenderLoginPath("abc")).toContain("recommenderRequest=");
  });

  it("builds redirect path", () => {
    expect(getRecommenderRedirectPath("abc")).toBe("/recommenders/abc");
  });

  it("matches email", () => {
    expect(recommenderEmailMatchesRequest({
      recommenderEmail: "Coach@Example.com",
      userEmail: "coach@example.com",
    })).toBe(true);
  });
});
