import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import {
  DIMENSIONS,
  DISTROS,
  getDesktop,
  getDistroBySlug,
  getFamily,
  getReleaseModel,
  INSTALL_DIFFICULTY_LABELS,
} from "../domain";
import { formatReviewedDate } from "../catalog/formatDate";
import {
  buildProfileOrigin,
  profileOriginState,
} from "../navigation/profile-origin";
import DistroDetailPage from "./DistroDetailPage";

function renderDetail(slug: string, state?: unknown): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[{ pathname: `/distros/${slug}`, state }]}>
      <Routes>
        <Route path="/distros/:slug" element={<DistroDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** React DOM Server's escaping, so dataset copy can be asserted verbatim. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("distro detail page", () => {
  it("renders the complete shared profile for every curated distro", () => {
    expect(DISTROS).toHaveLength(16);
    for (const distro of DISTROS) {
      const html = renderDetail(distro.slug);
      const has = (value: string) =>
        expect(html, `${distro.slug}: ${value}`).toContain(escapeHtml(value));

      has(distro.name);
      has(distro.tagline);
      has(distro.summary);
      has(getFamily(distro.family).label);
      has(distro.base);
      has(getReleaseModel(distro.releaseModel).label);
      has(distro.releaseNote);
      if (distro.desktops.length > 0) {
        has(distro.desktops.map((id) => getDesktop(id).label).join(", "));
      } else {
        has("No default desktop");
      }
      if (distro.desktopNote) {
        has(distro.desktopNote);
      }
      for (const item of [
        ...distro.bestFor,
        ...distro.notIdealFor,
        ...distro.tradeoffs,
      ]) {
        has(item);
      }
      for (const dimension of DIMENSIONS) {
        has(dimension.label);
        has(dimension.lowLabel);
        has(dimension.highLabel);
        has(distro.ratings[dimension.id].rationale);
      }
      expect(html.match(/class="detail-rating"/g)).toHaveLength(10);
      has(INSTALL_DIFFICULTY_LABELS[distro.whatToExpect.installDifficulty]);
      for (const text of [
        distro.whatToExpect.install,
        distro.whatToExpect.maintenance,
        distro.whatToExpect.softwareInstall,
        distro.whatToExpect.whoWillFeelAtHome,
      ]) {
        has(text);
      }
      for (const href of [
        distro.links.website,
        distro.links.download,
        distro.links.docs,
      ]) {
        expect(html).toContain(`href="${escapeHtml(href)}"`);
      }
      has("Last reviewed");
      expect(html).toContain(`dateTime="${distro.lastReviewed}"`);
      has(formatReviewedDate(distro.lastReviewed));
      has("Best for");
      has("Not ideal for");
      has("Key tradeoffs");
      has("What to expect");
      expect(html).toContain('href="/"');
      expect(html).toContain('href="/catalog"');
      expect(html).toContain(`href="/catalog?compare=${distro.slug}"`);
    }
  });

  it("surfaces cautionary guidance for advanced distros only", () => {
    const arch = renderDetail("arch-linux");
    const caveat = getDistroBySlug("arch-linux")?.caveat;
    expect(caveat).toBeDefined();
    expect(arch).toContain(escapeHtml(caveat!.headline));
    expect(arch).toContain(escapeHtml(caveat!.detail));
    expect(arch).toContain("A heads-up for newcomers");
    expect(arch).toContain("Take the newcomer quiz");
    expect(arch).toContain('href="/quiz/newcomer"');

    const ubuntu = renderDetail("ubuntu");
    expect(ubuntu).not.toContain("class=\"detail-caution\"");
    expect(ubuntu).toContain("Best for");
  });

  it("returns to the exact view the profile was opened from", () => {
    const fromResults = renderDetail(
      "ubuntu",
      profileOriginState(buildProfileOrigin("results")),
    );
    expect(fromResults).toContain("Back to your results");
    expect(fromResults).toContain('href="/results"');

    const fromCatalog = renderDetail(
      "ubuntu",
      profileOriginState(
        buildProfileOrigin("catalog", "?q=linux&dim=gaming&sort=name"),
      ),
    );
    expect(fromCatalog).toContain("Back to catalog");
    expect(fromCatalog).toContain(
      'href="/catalog?q=linux&amp;dim=gaming&amp;sort=name"',
    );

    const fromComparison = renderDetail(
      "ubuntu",
      profileOriginState(
        buildProfileOrigin("compare", "?distros=ubuntu,debian", {
          catalogSearch: "?q=ubuntu",
          catalogScrollY: 400,
        }),
      ),
    );
    expect(fromComparison).toContain("Back to comparison");
    expect(fromComparison).toContain('href="/compare?distros=ubuntu%2Cdebian"');

    const direct = renderDetail("ubuntu");
    expect(direct).toContain('href="/catalog"');
    expect(direct).toContain("Back to catalog");
  });

  it("handles unknown slugs without crashing", () => {
    const html = renderDetail("not-a-distro");
    expect(html).toContain("We don’t have that profile");
    expect(html).toContain("All 16 distros");
    expect(html).toContain('href="/catalog"');
  });

  it("is wired into the app shell at /distros/:slug", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/distros/nixos"]}>
        <App />
      </MemoryRouter>,
    );
    expect(html).toContain('id="detail-title"');
    expect(html).toContain("NixOS");
    expect(html).not.toContain("Detailed distro profiles are coming soon");
  });
});
