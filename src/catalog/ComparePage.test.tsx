import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DIMENSIONS } from "../domain";
import ComparePage from "./ComparePage";

function renderComparison(search: string, state?: unknown): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[{ pathname: "/compare", search, state }]}>
      <ComparePage />
    </MemoryRouter>,
  );
}

describe("comparison page", () => {
  it("renders selected profiles and every dimension side by side", () => {
    const html = renderComparison("?distros=ubuntu,debian,arch-linux");
    expect(html).toContain("Side-by-side comparison");
    for (const field of ["Family &amp; base", "Release model", "Default desktop(s)", "Best for", "Not ideal for", "Key tradeoffs", "What to expect"]) {
      expect(html).toContain(field);
    }
    for (const dimension of DIMENSIONS) {
      expect(html).toContain(dimension.label.replace(/&/g, "&amp;"));
    }
    expect(html.match(/class="compare-rating-cell"/g)).toHaveLength(30);
    expect(html).toContain("No default desktop");
    expect(html).toContain("Remove Ubuntu from comparison");
    expect(html).toContain("Ubuntu website (opens in a new tab)");
  });

  it("caps and normalizes direct links, and handles empty selections", () => {
    const html = renderComparison("?distros=ubuntu,unknown,ubuntu,debian,fedora-workstation,arch-linux");
    expect(html.match(/class="compare-distro-head"/g)).toHaveLength(3);
    expect(html).not.toContain("Remove Arch Linux from comparison");
    const empty = renderComparison("?distros=unknown");
    expect(empty).toContain("No distros selected yet");
    expect(empty).not.toContain("<table");
  });

  it("returns to the originating catalog view with the current selection", () => {
    const html = renderComparison("?distros=debian", {
      catalogSearch: "?q=linux&dim=gaming&sort=name&compare=ubuntu&compare=debian",
    });
    expect(html).toContain("/catalog?q=linux&amp;dim=gaming&amp;sort=name&amp;compare=debian");
    expect(html).toContain("Comparing one distro");
  });
});
