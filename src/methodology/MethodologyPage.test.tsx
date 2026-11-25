import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  DIMENSIONS,
  DISTROS,
  EXPERIENCED_QUIZ,
  FIT_LABEL_MEANINGS,
  FIT_LABELS,
  NEWCOMER_QUIZ,
} from "../domain";
import { formatReviewedDate } from "../catalog/formatDate";
import App from "../App";
import MethodologyPage from "./MethodologyPage";

function renderPage(): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={["/methodology"]}>
      <MethodologyPage />
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

describe("methodology page", () => {
  it("explains every shared dimension on the 1–5 scale", () => {
    const html = renderPage();
    expect(html).toContain("How we recommend");
    for (const dimension of DIMENSIONS) {
      expect(html).toContain(escapeHtml(dimension.label));
      expect(html).toContain(escapeHtml(dimension.description));
      expect(html).toContain(escapeHtml(dimension.lowLabel));
      expect(html).toContain(escapeHtml(dimension.highLabel));
    }
    expect(html.match(/class="method-dimension-row"/g)).toHaveLength(
      DIMENSIONS.length,
    );
  });

  it("explains the quiz mapping, the neutral answer and qualitative fit", () => {
    const html = renderPage();
    expect(html).toContain(`${NEWCOMER_QUIZ.questions.length} questions`);
    expect(html).toContain(`${EXPERIENCED_QUIZ.questions.length} questions`);
    expect(html).toContain("I’m not sure");
    expect(html).toContain("neutral");
    expect(html).toContain("weight");
    for (const label of FIT_LABELS) {
      expect(html).toContain(label);
      expect(html).toContain(escapeHtml(FIT_LABEL_MEANINGS[label]));
    }
    expect(html).toContain("No percentages");
    expect(html).not.toMatch(/\d+%/);
  });

  it("documents the curated set, caveats and review dates", () => {
    const html = renderPage();
    expect(DISTROS).toHaveLength(16);
    expect(html).toContain(`${DISTROS.length} curated profiles`);
    for (const distro of DISTROS) {
      expect(html).toContain(escapeHtml(distro.name));
      expect(html).toMatch(
        new RegExp(
          `<time[^>]*${distro.lastReviewed}[^>]*>${escapeHtml(
            formatReviewedDate(distro.lastReviewed),
          )}</time>`,
          "i",
        ),
      );
      if (distro.caveat) {
        expect(html).toContain(escapeHtml(distro.caveat.headline));
      }
    }
    expect(html).toContain("manually curated");
    expect(html).toContain("static");
    expect(html).toContain("Last reviewed");
  });

  it("replaces the placeholder on the /methodology route", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/methodology"]}>
        <App />
      </MemoryRouter>,
    );
    expect(html).toContain('id="method-title"');
    expect(html).not.toContain("COMING SOON");
  });
});
