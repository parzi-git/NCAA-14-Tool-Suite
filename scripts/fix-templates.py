import json

# Read the original equipment templates
with open('logic/equipment_templates.json', 'r') as f:
    content = f.read()

# Replace all instances of "PRSL" with "PLSR"
fixed_content = content.replace('"PRSL"', '"PLSR"')

# Parse to verify it's still valid JSON
templates = json.loads(fixed_content)
print(f"[v0] Successfully parsed {len(templates)} templates")

# Count replacements
original_count = content.count('"PRSL"')
fixed_count = fixed_content.count('"PLSR"')
print(f"[v0] Replaced {original_count} instances of PRSL with PLSR")

# Write the fixed content back
with open('logic/equipment_templates.json', 'w') as f:
    f.write(fixed_content)

print(f"[v0] Successfully updated equipment_templates.json")
print(f"[v0] Verification: File now contains {fixed_count} instances of PLSR")
