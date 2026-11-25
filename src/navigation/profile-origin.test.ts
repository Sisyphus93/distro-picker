import { describe, expect, it } from "vitest";
import {
  buildProfileOrigin,
  parseProfileOrigin,
  profileOriginState,
  readCatalogScrollY,
  rememberCatalogScrollY,
} from "./profile-origin";

describe("profile origin navigation", () => {
  it("builds known in-app paths and preserves the catalog's URL state", () => {
    const origin = buildProfileOrigin(
      "catalog",
      "?q=linux&dim=gaming&sort=name&compare=ubuntu&compare=debian",
    );
    expect(origin).toEqual({
      source: "catalog",
      path: "/catalog?q=linux&dim=gaming&sort=name&compare=ubuntu&compare=debian",
    });
    expect(profileOriginState(origin)).toEqual({ profileOrigin: origin });
    expect(buildProfileOrigin("results", "").path).toBe("/results");
    expect(buildProfileOrigin("home").path).toBe("/");
  });

  it("carries the comparison view's return context through a profile visit", () => {
    const origin = buildProfileOrigin("compare", "?distros=ubuntu,debian", {
      catalogSearch: "?q=ubuntu",
      catalogScrollY: 123.6,
    });
    expect(origin.path).toBe("/compare?distros=ubuntu%2Cdebian");
    expect(origin.compareContext).toEqual({
      catalogSearch: "?q=ubuntu",
      catalogScrollY: 124,
    });
    expect(parseProfileOrigin(profileOriginState(origin))).toEqual(origin);
  });

  it("rejects tampered state, off-site paths and source/path mismatches", () => {
    expect(parseProfileOrigin(null)).toBeNull();
    expect(parseProfileOrigin({ profileOrigin: "catalog" })).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "unknown", path: "/catalog" },
      }),
    ).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "catalog", path: "https://evil.example" },
      }),
    ).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "catalog", path: "//evil.example" },
      }),
    ).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "catalog", path: "/results?q=x" },
      }),
    ).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "home", path: "/catalog" },
      }),
    ).toBeNull();
    expect(
      parseProfileOrigin({
        profileOrigin: { source: "catalog", path: "/catalog?q=x#frag" },
      }),
    ).toEqual({ source: "catalog", path: "/catalog?q=x" });
  });

  it("ignores malformed comparison context", () => {
    expect(
      parseProfileOrigin({
        profileOrigin: {
          source: "compare",
          path: "/compare?distros=ubuntu",
          compareContext: { catalogScrollY: -20, catalogSearch: "" },
        },
      }),
    ).toEqual({ source: "compare", path: "/compare?distros=ubuntu" });
  });

  it("remembers only finite, non-negative scroll positions", () => {
    rememberCatalogScrollY(812.4);
    expect(readCatalogScrollY()).toBe(812);
    rememberCatalogScrollY(Number.NaN);
    rememberCatalogScrollY(-10);
    expect(readCatalogScrollY()).toBe(812);
  });
});
