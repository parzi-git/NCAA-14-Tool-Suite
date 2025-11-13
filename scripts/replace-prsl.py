import json

# Read the equipment templates file
with open('logic/equipment_templates.json', 'r') as f:
    content = f.read()

# Replace all instances of PRSL with PLSR
content_fixed = content.replace('"PRSL"', '"PLSR"')

# Verify it's still valid JSON
templates = json.loads(content_fixed)

# Write back to the file
with open('logic/equipment_templates.json', 'w') as f:
    json.dump(templates, f, indent=2)

print(f"Successfully replaced all instances of PRSL with PLSR")
print(f"Total templates: {len(templates)}")
