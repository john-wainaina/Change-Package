#!/usr/bin/env python3
"""
NEST360 Change Package Navigator — Build Script
Reads YAML data files from ../data/, assembles into data.json,
injects into template.html + app.js to produce the final HTML.

Usage:
    python3 build.py
    python3 build.py --validate-only   (check YAML syntax without building)
"""
import json, os, sys, glob, re
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML not installed. Run: pip install pyyaml")
    sys.exit(1)

BASE = Path(__file__).parent
DATA_DIR = BASE.parent / "data"
DIST_DIR = BASE.parent / "dist"
TEMPLATE = BASE / "template.html"
APP_JS = BASE / "app.js"
OUTPUT = DIST_DIR / "nest360-change-package-navigator.html"

VALIDATE_ONLY = "--validate-only" in sys.argv

REQUIRED_META_KEYS = {"version", "release_date", "intro_steps"}
REQUIRED_MODULE_KEYS = {"id", "name", "short", "gaps"}
REQUIRED_GAP_KEYS = {"id", "title", "ideas"}
REQUIRED_IDEA_KEYS = {"idea", "rationale", "measure"}

MODULE_ORDER = ["cpap", "kmc", "hypothermia", "phototherapy", "ipc"]


def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def validate_meta(meta, path):
    missing = REQUIRED_META_KEYS - set(meta.keys())
    if missing:
        raise ValueError(f"{path}: missing keys {missing}")
    if not isinstance(meta["intro_steps"], list):
        raise ValueError(f"{path}: intro_steps must be a list")


def validate_module(mod, path):
    missing = REQUIRED_MODULE_KEYS - set(mod.keys())
    if missing:
        raise ValueError(f"{path}: missing module keys {missing}")
    for i, gap in enumerate(mod["gaps"]):
        gm = REQUIRED_GAP_KEYS - set(gap.keys())
        if gm:
            raise ValueError(f"{path} gap[{i}] '{gap.get('id','?')}': missing keys {gm}")
        for j, idea in enumerate(gap["ideas"]):
            im = REQUIRED_IDEA_KEYS - set(idea.keys())
            if im:
                raise ValueError(f"{path} gap[{i}] idea[{j}]: missing keys {im}")


def main():
    errors = []

    # Load and validate meta
    meta_path = DATA_DIR / "_meta.yaml"
    if not meta_path.exists():
        print(f"ERROR: {meta_path} not found"); sys.exit(1)
    meta = load_yaml(meta_path)
    try:
        validate_meta(meta, meta_path)
    except ValueError as e:
        errors.append(str(e))

    # Load and validate modules
    modules = []
    for mod_id in MODULE_ORDER:
        path = DATA_DIR / f"{mod_id}.yaml"
        if not path.exists():
            errors.append(f"Missing module file: {path}")
            continue
        mod = load_yaml(path)
        try:
            validate_module(mod, path)
        except ValueError as e:
            errors.append(str(e))
        modules.append(mod)

    # Load additional resources
    ar_path = DATA_DIR / "additional_resources.yaml"
    additional_resources = load_yaml(ar_path) if ar_path.exists() else []

    rl_path = DATA_DIR / "resource_links.yaml"
    resource_links = load_yaml(rl_path) if rl_path.exists() else {}

    if errors:
        print("\n=== VALIDATION ERRORS ===")
        for e in errors:
            print(f"  ✗ {e}")
        print(f"\n{len(errors)} error(s) found. Fix before building.")
        sys.exit(1)

    total_gaps = sum(len(m["gaps"]) for m in modules)
    total_ideas = sum(len(g["ideas"]) for m in modules for g in m["gaps"])
    print(f"✓ Validation passed: {len(modules)} modules, {total_gaps} gaps, {total_ideas} ideas")

    if VALIDATE_ONLY:
        print("Validate-only mode — not building HTML.")
        return

    # Assemble data
    data = {
        "version": meta["version"],
        "release_date": meta.get("release_date", ""),
        "introSteps": [[s["label"], s["text"]] for s in meta["intro_steps"]],
        "modules": modules,
        "additionalResources": additional_resources,
        "resourceLinks": resource_links,
    }

    # Normalise gaps: ensure gap_type and category are present even if null
    for mod in data["modules"]:
        for g in mod["gaps"]:
            g.setdefault("gap_type", None)
            g.setdefault("category", None)
            g.setdefault("resources", [])
            for idea in g["ideas"]:
                idea.setdefault("resources", [])

    # Read template and JS
    if not TEMPLATE.exists():
        print(f"ERROR: {TEMPLATE} not found"); sys.exit(1)
    if not APP_JS.exists():
        print(f"ERROR: {APP_JS} not found"); sys.exit(1)

    template = TEMPLATE.read_text(encoding="utf-8")
    app_js = APP_JS.read_text(encoding="utf-8")

    # Embed
    safe_json = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    safe_json = safe_json.replace("</script", "<\\/script")

    assert template.count("__DATA_JSON__") == 1, "template must contain exactly one __DATA_JSON__"
    assert template.count("__APP_JS__") == 1, "template must contain exactly one __APP_JS__"

    final = template.replace("__DATA_JSON__", safe_json).replace("__APP_JS__", app_js)

    DIST_DIR.mkdir(exist_ok=True)
    OUTPUT.write_text(final, encoding="utf-8")

    size_kb = OUTPUT.stat().st_size / 1024
    print(f"✓ Built: {OUTPUT} ({size_kb:.0f} KB)")
    print(f"  Modules : {len(modules)}")
    for m in modules:
        n_ideas = sum(len(g['ideas']) for g in m['gaps'])
        print(f"    {m['id']}: {len(m['gaps'])} gaps, {n_ideas} ideas")
    print(f"  Total   : {total_gaps} gaps, {total_ideas} ideas")
    linked = sum(1 for v in resource_links.values() if v)
    print(f"  Resource links: {linked}/{len(resource_links)} have a verified URL")


if __name__ == "__main__":
    main()
