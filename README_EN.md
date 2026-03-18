# Feature Menu - Claude Code Feature Center

[English](README.md) | 中文

---

One-click to browse and manage all your installed Claude Code skills, agents, and commands.

## Features

- **Skills Browser** - View all installed skills, agents, and commands
- **Category Filter** - Find tools quickly by category
- **Search** - Keyword search, instant location
- **Task Recommendation** - Tell it what you want to do, it recommends the right skill
- **Favorites** - Bookmark frequently used skills for quick access
- **Recent** - Quick access to recently used skills

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Feature Menu                          │
│                                                          │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│   │ Skills  │    │ Agents  │    │Commands │             │
│   └────┬────┘    └────┬────┘    └────┬────┘             │
│        └──────────────┼──────────────┘                  │
│                       ▼                                  │
│            ┌──────────────────┐                         │
│            │   Local Scanner  │                         │
│            │  (scanner.ts)    │                         │
│            └────────┬─────────┘                         │
│                     ▼                                   │
│         Auto-detect Claude Code directory               │
│         - CLAUDE_CODE_ROOT env var                      │
│         - ~/.claude                                      │
│         - ~/everything-claude-code                       │
└─────────────────────────────────────────────────────────┘
```

## Installation

### Method 1: Claude Code Plugin (Recommended)

```
/plugin install ryushowtime/feature-menu
```

Then use `/feature-menu` to launch!

### Method 2: npx One-Click

```bash
npx feature-menu
```

### Method 3: Manual Install

1. Clone the repo:
```bash
git clone https://github.com/ryushowtime/feature-menu.git
cd feature-menu
```

2. Install dependencies:
```bash
npm install
```

3. Start the service:
```bash
# macOS/Linux
./start.sh

# Windows
start.bat

# Or manually
npm run dev
```

4. Open browser to http://localhost:3000

## Usage

In Claude Code, simply type:

```
/feature-menu
```

Or tell Claude "open feature menu", "feature menu", or "功能菜单".

## Requirements

| Requirement | Description |
|------------|-------------|
| Node.js | 18.0 or higher |
| npm/yarn/pnpm | Any one |
| Claude Code | Only for plugin method |

## One-Click Startup Scripts

| Platform | Script | Description |
|----------|--------|-------------|
| macOS/Linux | `start.sh` | Auto-detect Node.js, install deps, start server, open browser |
| Windows | `start.bat` | Same as above, Windows batch version |
| npm | `npx feature-menu` | Global install via npm |

## Project Structure

```
feature-menu/
├── app/                    # Next.js app
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Layout component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SkillCard.tsx      # Skill card
│   ├── SearchBar.tsx      # Search bar
│   ├── CategoryFilter.tsx # Category filter
│   └── ...
├── lib/                    # Utilities
│   ├── scanner.ts         # File scanner (auto-detect Claude Code directory)
│   └── types.ts           # Type definitions
├── bin/                    # CLI entry
│   └── feature-menu.js    # npx entry script
├── start.sh               # macOS/Linux startup script
├── start.bat              # Windows startup script
├── SKILL.md               # Claude Code skill file
└── README.md              # This file
```

## FAQ

### Q: Service starts but shows "Claude Code directory not found"?

**A:** Make sure your Claude Code directory is in one of these locations:

| Priority | Path | Description |
|----------|------|-------------|
| 1 | `CLAUDE_CODE_ROOT` env var | Highest priority |
| 2 | `~/.claude` | Standard Claude Code directory |
| 3 | `~/everything-claude-code` | ECC user default |
| 4 | `~/Claude Code` | macOS default |

You can also set the env var:
```bash
export CLAUDE_CODE_ROOT=/path/to/your/claude-code-dir
```

### Q: Port 3000 is occupied?

**A:** Use a different port:
```bash
PORT=3001 npm run dev
```

### Q: How to update to latest version?

```bash
cd feature-menu
git pull origin main
npm install
```

## Troubleshooting

### Service fails to start

```bash
# 1. Make sure Node.js is installed
node --version

# 2. Remove node_modules and reinstall
rm -rf node_modules
npm install

# 3. Try again
npm run dev
```

### Cannot detect skills directory

```bash
# View detailed logs
DEBUG=* npm run dev

# Or specify path manually
CLAUDE_CODE_ROOT=~/my-claude-dir npm run dev
```

## Contributing

Issues and Pull Requests are welcome!

## Changelog

### v1.0.0
- Initial release
- Skills, agents, commands browsing
- Search and category filtering
- Favorites and recent features
- Auto-detect Claude Code directory

## License

[MIT License](LICENSE)

## Author

**ryushowtime**

- GitHub: [@ryushowtime](https://github.com/ryushowtime)
- Twitter: [@ryushowtime](https://twitter.com/ryushowtime)

---

If you find this project helpful, please give it a ⭐!
