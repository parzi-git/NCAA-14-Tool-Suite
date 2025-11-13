import os
import json
import time
import random
from datetime import datetime
import pandas as pd

# ------------------------- paths -------------------------
BASE_PATH = os.path.dirname(os.path.abspath(__file__))
LOGIC_DIR = os.path.join(BASE_PATH, "logic")
INPUT_DIR = os.path.join(BASE_PATH, "input")
OUTPUT_DIR = os.path.join(BASE_PATH, "output")

# ------------------------- io helpers --------------------
def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def ensure_dirs():
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------- load logic files --------------
position_map = load_json(os.path.join(LOGIC_DIR, "position_mapping.json"))
team_map = load_json(os.path.join(LOGIC_DIR, "team_mapping.json"))  # display only (future use)
jersey_map = load_json(os.path.join(LOGIC_DIR, "jersey_numbers.json"))
# equipment_templates.json is a LIST of templates with "positions": [PPOS ints]
templates_list = load_json(os.path.join(LOGIC_DIR, "equipment_templates.json"))

# ------------------------- constants ---------------------
# Global force-zero fields (always enforced)
FORCE_ZERO = [
    "PLEL", "PREL",  # elbows
    "PFLK",          # flak jacket
    "PJER",          # jersey sleeves
    "PRCB", "PLCB",  # calf braces
    "PLKL", "PRKL",  # knee braces (locked)
    "PLKN", "PRKN"   # knee pads (your rule: always 0)
]
# Fixed values
FORCE_VALUE = {
    "PHLM": 5  # Helmet always 5
}
# Socks randomized 0..2
def random_sock():
    return random.choice([0, 1, 2])

# Only these fields may be changed by equipment templates
TEMPLATE_FIELDS = ["PLSL","PRSL","PLWR","PRWR","PLBB","PRBB","PLFB","PRFB"]

# ------------------------- template application ----------
def apply_any_matching_template(df, i, ppos):
    """
    equipment_templates.json is a LIST of objects:
      {
        "name": "...",
        "positions": [int, int, ...],
        "PLSL": int, "PRSL": int, "PLWR": int, "PRWR": int,
        "PLBB": int, "PRBB": int, "PLFB": int, "PRFB": int
      }
    We pick ONE template at random among those where `ppos` is in template["positions"].
    Then write ONLY the 8 template fields.
    """
    pool = [t for t in templates_list
            if isinstance(t, dict)
            and "positions" in t
            and isinstance(t["positions"], list)
            and ppos in t["positions"]]
    if not pool:
        return  # no template for this position (OK)
    chosen = random.choice(pool)
    for k in TEMPLATE_FIELDS:
        if k in chosen:
            df.at[i, k] = chosen[k]

# ------------------------- global rules ------------------
def apply_global_rules(df, i):
    # Force zeros
    for col in FORCE_ZERO:
        if col in df.columns:
            df.at[i, col] = 0
    # Force fixed values
    for col, val in FORCE_VALUE.items():
        if col in df.columns:
            df.at[i, col] = val
    # Randomize socks 0..2
    if "PLSO" in df.columns:
        df.at[i, "PLSO"] = random_sock()

# ------------------------- jersey helpers ----------------
def flatten_ranges(ranges):
    """
    jersey_numbers.json stores e.g. "ranges": [[1,15],[90,99]]
    Return a flat list of all allowed numbers in those inclusive ranges.
    """
    out = []
    for lo, hi in ranges:
        if not (isinstance(lo, int) and isinstance(hi, int) and lo <= hi):
            raise ValueError(f"Bad jersey range: {lo}, {hi}")
        out.extend(range(lo, hi + 1))
    return out

def assign_jersey_numbers_teamwide(df):
    """
    Enforce team-wide uniqueness of PJEN, within allowed sets.
    For each team (TGID):
      - zero all PJEN (we fully reassign; no legacy carry-over)
      - group by PPOS
      - sort each group by POVR DESC
      - impact pass: assign IMPACT numbers randomly (remaining pool) to highest OVR first
      - range pass: assign remaining players randomly from the allowed ranges (minus used)
      - if the allowed pool is truly exhausted (rare), pick a number from allowed ranges
        even if it's already used, and count it as a forced duplicate (never out-of-range)
    """
    required = {"TGID","PPOS","POVR","PJEN"}
    if not required.issubset(df.columns):
        return df

    # normalize types
    df["PJEN"] = df["PJEN"].fillna(0).astype(int)
    df["TGID"] = df["TGID"].astype(int)
    df["PPOS"] = df["PPOS"].astype(int)
    df["POVR"] = df["POVR"].astype(int)

    # metrics
    forced_duplicates = 0

    # process per team
    for team_id, idxs in df.groupby("TGID").indices.items():
        team_rows = list(idxs)

        # wipe all PJEN for this team so we cleanly reassign
        for r in team_rows:
            df.at[r, "PJEN"] = 0

        used = set()  # numbers used across ENTIRE TEAM

        # build pos groups -> sorted by OVR desc
        pos_groups = {}
        for r in team_rows:
            ppos = int(df.at[r, "PPOS"])
            pos_groups.setdefault(ppos, []).append(r)
        for ppos in pos_groups:
            pos_groups[ppos].sort(key=lambda rr: int(df.at[rr, "POVR"]), reverse=True)

        # precompute allowed for each ppos
        allowed_cache = {}  # ppos -> (impacts, allowed_all)
        for ppos in pos_groups:
            meta = jersey_map.get(str(ppos))
            if not meta:
                continue
            impacts = list(meta.get("impact", []))
            allowed_all = flatten_ranges(meta.get("ranges", []))
            allowed_cache[ppos] = (impacts, allowed_all)

        # --- impact pass ---
        for ppos, rows in pos_groups.items():
            if ppos not in allowed_cache:
                continue
            impacts, _ = allowed_cache[ppos]
            if not impacts:
                continue

            local_impacts = [n for n in impacts if n not in used]
            # iterate players in OVR order; assign a random remaining impact
            for r in rows:
                if not local_impacts:
                    break
                pick = random.choice(local_impacts)
                df.at[r, "PJEN"] = int(pick)
                used.add(pick)
                local_impacts.remove(pick)

        # --- range pass ---
        for ppos, rows in pos_groups.items():
            if ppos not in allowed_cache:
                continue
            _, allowed_all = allowed_cache[ppos]
            if not allowed_all:
                continue

            # create a randomized pool of allowed numbers minus used
            pool = [n for n in allowed_all if n not in used]
            random.shuffle(pool)
            ptr = 0

            for r in rows:
                if int(df.at[r, "PJEN"]) != 0:
                    continue  # already assigned an impact number
                # normal case: pick next unused from pool
                if ptr < len(pool):
                    pick = pool[ptr]
                    df.at[r, "PJEN"] = int(pick)
                    used.add(pick)
                    ptr += 1
                else:
                    # exhausted: stay in-range; allow a duplicate as last resort
                    # choose random from allowed_all (in-range), even if used
                    pick = random.choice(allowed_all)
                    df.at[r, "PJEN"] = int(pick)
                    # do not add to used (it already is); count it
                    forced_duplicates += 1

    # Optionally, you could log forced_duplicates somewhere
    # print(f"[debug] forced duplicates due to exhausted pools: {forced_duplicates}")
    return df
#export audit
def export_jersey_audit(df, timestamp):
    """
    Creates a second CSV containing:
    TGID, PPOS, PJEN, PFNA, PLNA, POVR
    Exported in that exact order.
    """
    cols = ["TGID", "PPOS", "PJEN", "PFNA", "PLNA", "POVR"]
    existing = [c for c in cols if c in df.columns]

    audit_df = df[existing].copy()

    audit_path = os.path.join(OUTPUT_DIR, f"jersey_audit_{timestamp}.csv")
    audit_df.to_csv(audit_path, index=False)

    print(f"→ Jersey audit exported: {audit_path}")

# ------------------------- main processing ---------------
def process_file(input_path, output_path):
    print("Please wait while changes are being made...")
    t0 = time.perf_counter()

    df = pd.read_csv(input_path)
    df.columns = df.columns.str.strip().str.upper()

    # -------- per-player rules --------
    for i in range(len(df)):
        # Global rules first
        apply_global_rules(df, i)
        # Apply one random template that declares this PPOS (if any)
        if "PPOS" in df.columns:
            ppos = int(df.at[i, "PPOS"])
            apply_any_matching_template(df, i, ppos)

    # -------- jersey numbers (team-wide uniqueness) --------
    df = assign_jersey_numbers_teamwide(df)

    # -------- save --------
    df.to_csv(output_path, index=False)

# Export audit file
    export_jersey_audit(df, timestamp)

    dt = time.perf_counter() - t0
    print(f"✔ Done in {dt:.2f} seconds.")
    print(f"→ Saved: {output_path}")


# ------------------------- cli ---------------------------
if __name__ == "__main__":
    ensure_dirs()

    # find first CSV in input/
    infile = None
    for fn in os.listdir(INPUT_DIR):
        if fn.lower().endswith(".csv"):
            infile = os.path.join(INPUT_DIR, fn)
            break

    if not infile:
        print("❌ No CSV found in /input/. Place your roster CSV there and run again.")
        time.sleep(2)
        raise SystemExit(1)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    outfile = os.path.join(OUTPUT_DIR, f"updated_roster_{timestamp}.csv")
    process_file(infile, outfile)
