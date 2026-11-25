import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

function renderRoute(path: string): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("app shell", () => {
  it("keeps the shared navigation and landmarks on every core route", () => {
    for (const path of [
      "/",
      "/quiz",
      "/quiz/newcomer",
      "/quiz/experienced",
      "/results",
      "/catalog",
      "/compare",
      "/methodology",
      "/distros/ubuntu",
    ]) {
      const html = renderRoute(path);
      expect(html, path).toContain('class="main-nav"');
      expect(html, path).toContain('href="/methodology"');
      expect(html, path).toContain('class="skip-link"');
      expect(html, path).toContain('id="main-content"');
    }
  });

  it("shows a real 404 page rather than placeholder copy", () => {
    const html = renderRoute("/not-a-page");
    expect(html).toContain("PAGE NOT FOUND");
    expect(html).toContain('id="not-found-title"');
    expect(html).not.toContain("COMING SOON");
  });
});
