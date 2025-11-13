# NCAA 14 Roster Tool - Local Setup

A dark minimalist roster management tool for NCAA Football 14.

## Quick Start

### Prerequisites
- Node.js 18+ installed ([download here](https://nodejs.org/))

### Installation

1. **Download this project** (via GitHub or ZIP from v0)

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the app**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - The app runs completely locally - no internet required after setup!

## Features

- ✅ CSV roster import/export
- ✅ Equipment template assignment (171 templates)
- ✅ Jersey number management with position-specific ranges
- ✅ Global player attribute rules (stamina, injury, position-specific stats)
- ✅ Top 5 player reports by position group
- ✅ Conference filtering (NCAA, SEC, Big Ten, ACC, Big 12, Pac-12)
- ✅ Player/team search with detailed views
- ✅ Dark minimalist UI

## Project Structure

\`\`\`
├── app/                    # Next.js app router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with dark mode
│   └── globals.css        # Dark theme styles
├── components/            # React components
│   ├── file-upload-area.tsx
│   ├── query-panel.tsx
│   └── reporting-panel.tsx
├── lib/                   # Core logic
│   ├── roster-logic.ts    # Player processing rules
│   └── conference-mapping.ts
├── logic/                 # Configuration files
│   ├── equipment_templates.json
│   ├── jersey_numbers.json
│   ├── position_mapping.json
│   └── team_mapping.json
└── scripts/               # Utility scripts
\`\`\`

## How It Works

1. **Upload CSV** - Import your NCAA 14 roster export
2. **Processing** - Applies equipment, jerseys, and attribute rules
3. **Review** - Search players, view top performers by conference
4. **Export** - Download updated CSV to import back into NCAA 14

## Troubleshooting

**Port already in use?**
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

**Dependencies not installing?**
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Need to rebuild?**
\`\`\`bash
npm run build
npm start
