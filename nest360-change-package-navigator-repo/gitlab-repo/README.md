# NEST360 Change Package Navigator

An interactive web tool for browsing and searching the NEST360 Change Package — linking clinical coverage gaps to tested change ideas across CPAP, KMC, Hypothermia, Phototherapy, and IPC.

**Live tool:** `https://<your-gitlab-namespace>.gitlab.io/nest360-change-package-navigator/`

---

## Table of contents

1. [What this repository contains](#1-what-this-repository-contains)
2. [How the tool is updated and deployed](#2-how-the-tool-is-updated-and-deployed)
3. [Updating the content — step-by-step](#3-updating-the-content--step-by-step)
   - [Add a new change idea to an existing gap](#31-add-a-new-change-idea-to-an-existing-gap)
   - [Add a new gap to an existing module](#32-add-a-new-gap-to-an-existing-module)
   - [Edit existing text](#33-edit-existing-text)
   - [Update the version number](#34-update-the-version-number)
   - [Update the changelog](#35-update-the-changelog)
   - [Add or fix a resource link](#36-add-or-fix-a-resource-link)
4. [YAML file format explained](#4-yaml-file-format-explained)
5. [What to do if the build fails](#5-what-to-do-if-the-build-fails)
6. [Embedding the tool elsewhere](#6-embedding-the-tool-elsewhere)
7. [Deep linking to specific gaps](#7-deep-linking-to-specific-gaps)
8. [Repository structure](#8-repository-structure)
9. [For developers: running locally](#9-for-developers-running-locally)

---

## 1. What this repository contains

```
data/               ← CONTENT LIVES HERE — this is what you edit
  _meta.yaml        ← Version number, intro steps, sustaining improvements text
  cpap.yaml         ← All CPAP gaps and change ideas
  kmc.yaml          ← All KMC gaps and change ideas
  hypothermia.yaml  ← All Hypothermia gaps and change ideas
  phototherapy.yaml ← All Phototherapy gaps and change ideas
  ipc.yaml          ← All IPC gaps and change ideas
  additional_resources.yaml
  resource_links.yaml ← URL for every clickable resource (see Section 3.6)

build/              ← Technical files — do not edit unless you are a developer
  build.py          ← Script that converts YAML → final HTML
  template.html     ← HTML/CSS structure of the tool
  app.js            ← JavaScript behaviour

dist/               ← Auto-generated output — do not edit directly
  nest360-change-package-navigator.html

.gitlab-ci.yml      ← Automated pipeline (runs on every commit)
CHANGELOG.md        ← Version history — update this when you change content
README.md           ← This file
```

**The only files you need to edit are those inside `data/` and `CHANGELOG.md`.**

---

## 2. How the tool is updated and deployed

When you edit any file in this repository and commit (save) the change in GitLab:

1. GitLab automatically runs the **CI/CD pipeline** (takes about 2 minutes).
2. The pipeline checks your YAML for syntax errors.
3. If valid, it builds a new HTML file and **deploys it to the live URL**.
4. If there is an error, the previous working version stays live and you receive a notification.

You do not need to run any software on your computer. Everything happens in the browser.

---

## 3. Updating the content — step-by-step

All steps happen in GitLab's web interface. You need Editor or Maintainer access to the repository.

### 3.1 Add a new change idea to an existing gap

**Example:** Adding a new idea to the IPC "Poor hand hygiene" gap.

1. Go to the repository in GitLab.
2. Click **`data/`** → click **`ipc.yaml`**.
3. Click the **Edit** button (pencil icon, top right of the file view).
4. Find the gap you want to update. Use Ctrl+F / Cmd+F to search for the gap title, e.g. `Poor hand hygiene`.
5. Scroll down to the `ideas:` list within that gap.
6. Add your new idea at the end of the list, following this format exactly:

```yaml
    - idea: Your change idea title goes here
      rationale: Explain why this change idea works.
      measure: How you will measure implementation (e.g. Number of sessions conducted)
```

   If the idea has associated resources, add them like this:

```yaml
    - idea: Your change idea title goes here
      rationale: Explain why this change idea works.
      measure: How you will measure implementation.
      resources:
        - Name of resource 1
        - Name of resource 2
```

7. **Indentation matters.** Each idea starts with 4 spaces, then a dash, then a space. Each field (idea, rationale, measure, resources) is indented 6 spaces. The easiest way to get this right is to copy and paste an existing idea and edit the text.
8. Scroll down to the **Commit changes** section.
9. In the commit message box, write something descriptive, e.g.: `IPC: add new hand hygiene idea on alcohol gel dispensers`
10. Leave "Commit to the main branch" selected and click **Commit changes**.
11. Navigate to **CI/CD → Pipelines** in the left menu to watch the build. A green tick means deployment succeeded.
12. Also update `CHANGELOG.md` (see Section 3.5).

---

### 3.2 Add a new gap to an existing module

**Example:** Adding a new gap to the CPAP module.

1. Open **`data/cpap.yaml`** and click **Edit**.
2. Scroll to the end of the `gaps:` list.
3. Add a new gap block. Every gap needs at minimum:

```yaml
  - id: your-gap-id            # lowercase, hyphens only, no spaces — used in URLs
    title: Your gap title here
    gap_type: Care quality      # Use "Care quality" or "Data quality"
    ideas:
      - idea: First change idea
        rationale: Why this works.
        measure: How you measure it.
```

   For IPC, use `category` instead of `gap_type`:

```yaml
  - id: your-gap-id
    title: Your gap title here
    category: Infection protection prevention  # or: Infection detection practices / Infection care
    ideas:
      - idea: First change idea
        rationale: Why this works.
        measure: How you measure it.
```

4. Commit and update the CHANGELOG.

**Important:** The `id` field becomes part of the URL for that gap (e.g. `#/cpap/your-gap-id`). Once set and shared with others, avoid changing it — it would break any existing links.

---

### 3.3 Edit existing text

1. Open the relevant module YAML file and click **Edit**.
2. Find the text you want to change (Ctrl+F is your friend).
3. Edit the text directly. Be careful with indentation — do not add or remove leading spaces.
4. Commit with a clear message, e.g.: `KMC: update rationale for skin-to-skin idea 2`
5. Update the CHANGELOG.

---

### 3.4 Update the version number

When you release a new version of the tool (e.g. when a new Change Package PDF is published):

1. Open **`data/_meta.yaml`** and click **Edit**.
2. Change the `version` and `release_date` fields:

```yaml
version: "1.1"
release_date: "March 2026"
```

3. Commit: `Bump version to 1.1 — March 2026 Change Package update`
4. Add a full entry to `CHANGELOG.md`.

---

### 3.5 Update the changelog

After any content change, open `CHANGELOG.md`, click **Edit**, and add an entry at the top of the file:

```markdown
## [1.1] – March 2026

### CPAP
- Added: "Not enough oxygen" gap — 3 new change ideas from Kenya site learning

### IPC
- Updated: "Poor hand hygiene" gap — revised rationale for idea 3 based on new WHO guidance
```

Commit: `CHANGELOG: document v1.1 changes`

---

### 3.6 Add or fix a resource link

Every clickable "resource" tag (e.g. "BMET Technical Job Aids") gets its URL from a single lookup file: **`data/resource_links.yaml`**. It's a flat list of resource name → URL pairs:

```yaml
'BMET Technical Job Aids': https://nest360.org/project/technical-job-aids/
'KMC clinical guidelines': null    # no source link — renders as plain text, not clickable
'OSCE template': '#/resources'     # internal — jumps to this tool's own Additional Resources page
```

**To add a link for a resource that currently has none:**
1. Open `data/resource_links.yaml` and click **Edit**.
2. Find the resource name (must match the spelling used in the module YAML files **exactly**, including capitalization).
3. Replace `null` with the real URL, in quotes: `'KMC clinical guidelines': 'https://example.org/kmc-guidelines.pdf'`
4. Commit with a clear message, e.g. `resource_links: add URL for KMC clinical guidelines`.

**Important — only add a link if you have a real, verified URL.** If a resource doesn't have a confirmed source link, leave it as `null`. A resource tag with no link still displays — it just isn't clickable — which is far better than a link that's wrong or broken. Do not guess at a plausible-looking URL.

**If a new module YAML adds a resource name that has no entry here**, it will render as plain (non-clickable) text automatically — nothing breaks, but it's worth adding the entry once you have the real URL.

---

## 4. YAML file format explained

YAML uses indentation (spaces) to define structure. Here is a fully annotated example:

```yaml
# This is a comment — ignored by the tool
id: cpap                              # Module identifier — do not change
name: CPAP                            # Full display name
short: CPAP                           # Short name used in the sidebar
gaps:

  - id: equipment                     # Gap identifier — used in URLs
    title: Not enough working equipment
    gap_type: Care quality            # "Care quality" or "Data quality"
    resources:                        # Resources that apply to the whole gap (optional)
      - BMET Technical Job Aids
    ideas:

      - idea: Track the occurrence of CPAP planned preventative maintenance (PPM)
        rationale: Routine PPM prevents breakdowns, ensuring devices are available when needed.
        measure: Number of times PPM occurs
        resources:                    # Resources specific to this idea (optional)
          - BMET Technical Job Aids

      - idea: Distribute additional CPAP machines while not compromising monitoring
        rationale: Increasing the number of CPAPs allows a facility to treat more newborns.
        measure: Number of additional CPAPs distributed
        # No resources field needed if there are none
```

**Common mistakes to avoid:**
- Using tabs instead of spaces (YAML only allows spaces)
- Forgetting the `-` before an idea or gap
- Mismatching indentation
- Using a colon (`:`) inside text without quoting the line: `idea: "Use ratio 1:2"` ✓

If in doubt, paste your edited YAML into [yamllint.com](https://www.yamllint.com) to check for errors before committing.

---

## 5. What to do if the build fails

1. In GitLab, go to **CI/CD → Pipelines**.
2. Click the failed pipeline (red ✗).
3. Click the failed job name to see the error log.
4. Common errors and fixes:

| Error message | Likely cause | Fix |
|---|---|---|
| `yaml.scanner.ScannerError` | Invalid YAML syntax | Check indentation; paste into yamllint.com |
| `missing keys {'rationale'}` | An idea is missing a required field | Add the missing field |
| `Missing module file` | A YAML file was accidentally renamed or deleted | Restore the file |

5. Edit the file to fix the error and commit again.

The previous working version stays live while the broken version is being fixed.

---

## 6. Embedding the tool elsewhere

The tool is a single HTML file and works inside an `<iframe>` anywhere.

**Note on the logo:** the header loads NEST360's real logo directly from `nest360.org`, so it always matches the live brand mark and stays in sync if NEST360 ever updates it — but it does mean the device needs internet access to display it. If it can't load (offline use, intranet-only deployment), it falls back automatically to a plain "N360" badge so the page never breaks. For a fully offline deployment, download the logo once from `https://nest360.org/wp-content/uploads/2021/04/NEST360_horizontal_logo_fullcolour.png`, save it next to the HTML file, and update the `src` in `build/template.html` to point to the local file instead.

**R Shiny** (`www/` folder approach):
```r
# Place the HTML file in your Shiny app's www/ folder, then:
shiny::tags$iframe(
  src = "nest360-change-package-navigator.html",
  style = "width:100%; height:85vh; border:none;"
)
# Or link directly to the GitLab Pages URL:
shiny::tags$iframe(
  src = "https://<namespace>.gitlab.io/nest360-change-package-navigator/",
  style = "width:100%; height:85vh; border:none;"
)
```

**Power BI / Tableau:** Use the "Web content" or "Web page" visual with the GitLab Pages URL.

**NEST360 website:** Embed with a standard `<iframe>` tag:
```html
<iframe src="https://<namespace>.gitlab.io/nest360-change-package-navigator/"
        style="width:100%; height:800px; border:none;" title="Change Package Navigator">
</iframe>
```

---

## 7. Deep linking to specific gaps

Every gap has a permanent URL. Use these to link directly from clinical indicator cards in dashboards.

URL format: `https://<pages-url>/#/<module-id>/<gap-id>`

**Examples:**
| Link target | URL |
|---|---|
| CPAP — Staff knowledge gap | `#/cpap/knowledge` |
| IPC — Hand hygiene gap | `#/ipc/hand-hygiene` |
| KMC — Mothers unavailable | `#/kmc/mothers-unavailable` |
| Hypothermia — Transport | `#/hypothermia/transport` |
| IPC — Antibiotic guidelines | `#/ipc/antibiotic-guidelines` |

The "Copy link" button on any gap page gives you the exact URL.

**To find the `id` for any gap**, look at the relevant YAML file — it is the value after `id:` at the start of each gap block.

---

## 8. Repository structure

```
.
├── .gitlab-ci.yml           CI/CD pipeline definition
├── CHANGELOG.md             Version history
├── README.md                This file
├── data/
│   ├── _meta.yaml           Version, intro steps, sustaining improvements
│   ├── cpap.yaml            CPAP module content
│   ├── kmc.yaml             KMC module content
│   ├── hypothermia.yaml     Hypothermia module content
│   ├── phototherapy.yaml    Phototherapy module content
│   ├── ipc.yaml             IPC module content
│   └── additional_resources.yaml
├── build/
│   ├── build.py             Build script (YAML → HTML)
│   ├── template.html        HTML/CSS shell
│   └── app.js               JavaScript
└── dist/
    └── nest360-change-package-navigator.html   (auto-generated, do not edit)
```

---

## 9. For developers: running locally

Requirements: Python 3.8+, PyYAML

```bash
# Clone the repo
git clone https://gitlab.com/<namespace>/nest360-change-package-navigator.git
cd nest360-change-package-navigator

# Install dependency
pip install pyyaml

# Validate YAML only
python3 build/build.py --validate-only

# Build HTML
python3 build/build.py

# Open in browser
open dist/nest360-change-package-navigator.html    # macOS
xdg-open dist/nest360-change-package-navigator.html  # Linux
```

To test changes before committing, edit a YAML file locally and run the build script. The output is written to `dist/`.

**Do not commit the `dist/` folder** — it is auto-generated by the pipeline. Add it to `.gitignore`.
