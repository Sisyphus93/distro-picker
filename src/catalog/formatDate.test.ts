import { describe, expect, it } from "vitest";
import { formatReviewedDate } from "./formatDate";

describe("formatReviewedDate", () => {
  it("formats an ISO date for people", () => {
    expect(formatReviewedDate("2026-11-25")).toBe("25 Nov 2026");
  });
  it("returns invalid input unchanged", () => {
    expect(formatReviewedDate("not-a-date")).toBe("not-a-date");
  });
});
