# Changelog

All changes to the NEST360 Change Package Navigator are recorded here.
Format: `## [version] – Date`, then bullet points grouped by module or type of change.

---

## [1.0] – August 2025

**Initial release** — built from the NEST360 Change Package (August 2025).

### Modules included
- **CPAP** — 12 coverage gaps, 39 change ideas
- **Kangaroo Mother Care (KMC)** — 14 coverage gaps, 81 change ideas
- **Hypothermia** — 14 coverage gaps, 68 change ideas
- **Phototherapy** — 6 coverage gaps, 16 change ideas
- **Infection Prevention and Control (IPC)** — 14 coverage gaps, 51 change ideas
  - Sub-categories: Infection protection prevention, Infection detection practices, Infection care

### Additional resources
- Ward Improvement Team (WIT) Meeting Minutes Template
- Bubble CPAP OSCE Template

### Resource links
- All 45 resource names across the Change Package are now cross-checked against the source PDF's own embedded hyperlinks — extracted programmatically from the PDF's link annotations (not guessed, not pulled from browsing nest360.org)
- 42 resources link directly to their verified source URL and open in a new tab
- 2 resources (OSCE template, QI Meeting Minutes Template) are internal links to this tool's own Additional Resources page, since the source PDF links to its own appendix rather than an external page — and that appendix is already fully transcribed here
- 1 resource ("KMC clinical guidelines", Hypothermia module) has no hyperlink anywhere in the source PDF and is intentionally left as plain, non-clickable text rather than guessed

### Branding
- Header now matches NEST360's actual site convention: white top bar with the real full-colour NEST360 logo (hotlinked from nest360.org), rather than a generic icon mark
- Primary navy (#094267) is NEST360's own confirmed brand colour, taken directly from their site's donate-button code rather than estimated
- Module icons replaced with original line-icon set matching each clinical theme: lungs (CPAP), heart with baby mark (KMC), thermometer (Hypothermia), sun (Phototherapy), shield (IPC) — used consistently on both the home page cards and the sidebar
- Module accent colours corrected to stay strictly within the confirmed navy/teal/gold family (earlier version had drifted to an off-brand purple and orange for visual variety)
- Typeface switched to Inter (Google Fonts), a deliberate professional choice in place of a generic system-font default — NEST360's literal CSS font-family could not be extracted (their site strips out via the available fetch tools), so this is the best-informed match rather than a confirmed exact one; system fonts remain as an offline fallback
- Removed an invented gradient accent stripe and a decorative header divider that didn't match the plainer, more restrained chrome of the real site; heading weights softened from extra-bold to bold throughout for a more institutional feel

### Features
- Full-text search across all change ideas, rationales, and resources
- Deep-linkable URLs for every gap (e.g. `#/ipc/hand-hygiene`) and every module (e.g. `#/cpap`)
- "Copy link" button at both module level and gap level, for wiring up dashboard indicator cards
- Gap-type filter chips per module (Care quality / Data quality; IPC sub-categories)
- Accordion idea cards with rationale, process measure, and resources
- Mobile-responsive layout: collapsible sidebar drawer, two-row header on phones (search drops below the logo row), larger touch targets for nav and buttons, single-column card grids on small screens, iOS zoom-on-focus fix for the search input
- Embeddable as iframe in R Shiny, Power BI, Tableau, NEST360 website

---

## How to add an entry

When you update the Change Package data, add a new section at the top of this file:

```
## [1.1] – Month Year

### Module name
- Added: [gap title] — brief description of new gap or ideas added
- Updated: [gap title] — what changed and why
- Removed: [gap title] — reason for removal
```

Keep it brief. The goal is that a user can scan the changelog and understand what changed between the version they know and the current one.
