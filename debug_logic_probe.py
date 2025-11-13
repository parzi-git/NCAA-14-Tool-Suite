import os, json, sys, glob, pandas as pd
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))
LOGIC = os.path.join(BASE, "logic")
INPUT = os.path.join(BASE, "input")

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def safe_exists(path, label):
    ok = os.path.exists(path)
    print(f"[{label}] {'FOUND' if ok else 'MISSING'} -> {path}")
    return ok

def preview(obj, n=3):
    if isinstance(obj, dict):
        ks = list(obj.keys())[:n]
        return f"dict keys sample={ks}"
    if isinstance(obj, list):
        return f"list len={len(obj)} sample={obj[:n]}"
    return f"type={type(obj)} repr={repr(obj)[:120]}"

def flatten_ranges(ranges):
    vals = []
    for lo, hi in ranges:
        if not (isinstance(lo, int) and isinstance(hi, int) and lo <= hi):
            raise ValueError(f"Bad range pair: {lo}, {hi}")
        vals.extend(range(lo, hi+1))
    return vals

def main():
    print("=== PROBE: logic/ JSONs ===")
    pm_p = os.path.join(LOGIC, "position_mapping.json")
    jn_p = os.path.join(LOGIC, "jersey_numbers.json")
    tm_p = os.path.join(LOGIC, "team_mapping.json")
    hm_p = os.path.join(LOGIC, "header_mapping.json")
    et_p = os.path.join(LOGIC, "equipment_templates.json")

    if not all([safe_exists(p, os.path.basename(p)) for p in [pm_p, jn_p, tm_p, hm_p, et_p]]):
        print("Fix missing files above and re-run.")
        sys.exit(1)

    pos_map = load_json(pm_p)
    jersey = load_json(jn_p)
    team_map = load_json(tm_p)
    header_map = load_json(hm_p)
    templates = load_json(et_p)

    print("\n--- position_mapping.json ---")
    print(preview(pos_map))
    # Expect: dict with int-like keys or strings "0".."20"
    # Normalize a getter:
    def get_pos_name(ppos):
        key = str(ppos) if str(ppos) in pos_map else ppos
        ent = pos_map.get(key)
        if not ent:
            return None
        # Accept either {"name": "..."} or {"POS": "..."} variants:
        return ent.get("name") or ent.get("POS") or ent.get("pos") or ent.get("label")

    # show a few samples
    for p in [0,3,4,10,13,16,19]:
        print(f"PPOS {p} -> pos_name={get_pos_name(p)}; raw={pos_map.get(str(p)) or pos_map.get(p)}")

    print("\n--- jersey_numbers.json ---")
    print(preview(jersey))
    # Validate structure
    bad_keys = [k for k,v in jersey.items() if not isinstance(v, dict) or "ranges" not in v or "impact" not in v]
    if bad_keys:
        print(f"ERROR: jersey_numbers entries missing ranges/impact: {bad_keys}")
    # Validate ranges flattening and sample counts
    for p in ["0","3","4","10","13","16","19"]:
        if p in jersey:
            rng = jersey[p]["ranges"]
            imp = jersey[p]["impact"]
            try:
                all_vals = flatten_ranges(rng)
                print(f"PPOS {p}: ranges_count={len(all_vals)} impact={imp}")
            except Exception as e:
                print(f"ERROR: ranges invalid for PPOS {p}: {e}")

    print("\n--- team_mapping.json ---")
    print(f"count={len(team_map)} sample={list(team_map.items())[:5]} (keys are strings? -> {all(isinstance(k,str) for k in team_map.keys())})")

    print("\n--- header_mapping.json ---")
    print(preview(header_map))

    print("\n--- equipment_templates.json ---")
    print(preview(templates))
    # Expect: dict keyed by position names -> list of dicts with exactly the 8 fields
    REQUIRED_FIELDS = {"PLSL","PRSL","PLWR","PRWR","PLBB","PRBB","PLFB","PRFB"}
    if not isinstance(templates, dict):
        print("ERROR: equipment_templates.json must be a dict keyed by position-name -> list of template dicts.")
    else:
        # list missing or empty positions and field problems
        missing_for = []
        field_issues = []
        for ppos in range(0,21):
            name = get_pos_name(ppos)
            if not name:
                missing_for.append(ppos)
                continue
            arr = templates.get(name)
            if not arr:
                missing_for.append(ppos)
                continue
            # check first few templates
            for t in arr[:3]:
                bad = set(t.keys()) - REQUIRED_FIELDS
                missing = REQUIRED_FIELDS - set(t.keys())
                if bad or missing:
                    field_issues.append((name, {"extra": list(bad), "missing": list(missing)}))
        if missing_for:
            print(f"NOTICE: positions with no templates available: {missing_for}")
        if field_issues:
            print(f"FIELD ISSUES in templates (first few): {field_issues[:5]}")
        else:
            print("Templates: keys/fields look correct for sampled entries.")

    # Load a CSV to confirm columns and a few rows
    print("\n=== PROBE: input/ CSV ===")
    csvs = glob.glob(os.path.join(INPUT, "*.csv"))
    if not csvs:
        print("No CSV found in /input. Add one and rerun.")
        return
    csv_path = csvs[0]
    print(f"Reading: {csv_path}")
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip().str.upper()
    need = ["TGID","PPOS","POVR","PJEN","PFNA","PLNA"]
    missing_cols = [c for c in need if c not in df.columns]
    if missing_cols:
        print(f"ERROR: CSV missing columns: {missing_cols}")
    print(f"Rows={len(df)}, columns={len(df.columns)}")
    print("Head (selected):")
    print(df[ [c for c in need if c in df.columns] ].head(10))

    # Show per-team uniqueness baseline
    print("\n--- PJEN uniqueness snapshot (team-level) ---")
    if "TGID" in df.columns and "PJEN" in df.columns:
        dups = []
        for t, sub in df.groupby("TGID"):
            nums = sub["PJEN"].dropna().astype(int)
            counts = Counter(nums)
            clashed = [n for n,c in counts.items() if n != 0 and c > 1]
            if clashed:
                dups.append((t, clashed[:10]))
        if dups:
            print(f"Duplicates exist in teams: {dups[:10]}")
        else:
            print("No duplicate numbers detected (current CSV state).")

    # Check that PPOS names map into templates dict keys
    print("\n--- PPOS → template key check on first 30 rows ---")
    check_rows = min(30, len(df))
    missing_template_hits = Counter()
    for i in range(check_rows):
        ppos = df.at[i, "PPOS"]
        name = get_pos_name(ppos)
        ok = name in templates
        print(f"Row {i}: PPOS={ppos} -> {name} | template_found={ok}")
        if not ok:
            missing_template_hits[name] += 1
    if missing_template_hits:
        print(f"Template missing key hits: {dict(missing_template_hits)}")

if __name__ == "__main__":
    main()
