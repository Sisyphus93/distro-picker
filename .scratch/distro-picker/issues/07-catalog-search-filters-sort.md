# 07: Catalog with search, filters, and sort

**What to build:** A browsable distro catalog for users who want to explore options directly. The catalog lists all 16 curated distros and supports search by name, dimension-based filters, and useful sorting. It uses the shared domain model and presents distro cards with enough information to scan and compare at a high level.

**Blocked by:** 02: Shared domain model and curated distro dataset.

**Status:** ready-for-agent

- [ ] Catalog page lists all 16 curated distros from the shared dataset.
- [ ] Users can search distros by name.
- [ ] Users can filter distros using the shared 10-dimension model (or clear filter controls derived from it), enabling meaningful narrowing of options.
- [ ] Users can sort the catalog by useful criteria (at minimum options covering beginner-friendly, lightweight/performance, gaming-ready, and stable/reliable use cases, as supported by the data model).
- [ ] Distro cards show key scan-friendly information (e.g., name, short description, release model/base, notable strengths/caveats) and link to distro detail.
- [ ] Catalog supports selecting distros for comparison (up to 3) with clear UI state, ready for the comparison view.
- [ ] Catalog is responsive and keyboard accessible, with clear filter/search labels and visible focus states.
