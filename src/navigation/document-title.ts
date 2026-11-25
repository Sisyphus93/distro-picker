import { getDistroBySlug } from "../domain";

const BASE_TITLE = "Distro Picker — Find your place in Linux";
const SUFFIX = "Distro Picker";

const ROUTE_TITLES: Record<string, string> = {
  "/": BASE_TITLE,
  "/quiz": `Choose a quiz path · ${SUFFIX}`,
  "/quiz/newcomer": `Newcomer quiz · ${SUFFIX}`,
  "/quiz/experienced": `Experienced quiz · ${SUFFIX}`,
  "/results": `Your results · ${SUFFIX}`,
  "/catalog": `Explore distros · ${SUFFIX}`,
  "/compare": `Compare distros · ${SUFFIX}`,
  "/methodology": `How we recommend · ${SUFFIX}`,
};

/**
 * The document title for a route. Client-side routing does not change it on
 * its own, and assistive technology announces it on navigation, so each page
 * gets a name that says where the visitor is.
 */
export function titleForPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") {
    return BASE_TITLE;
  }

  const profileMatch = path.match(/^\/distros\/([^/]+)$/);
  if (profileMatch) {
    const distro = getDistroBySlug(profileMatch[1]);
    return distro
      ? `${distro.name} · ${SUFFIX}`
      : `Profile not found · ${SUFFIX}`;
  }

  return ROUTE_TITLES[path] ?? `Page not found · ${SUFFIX}`;
}
