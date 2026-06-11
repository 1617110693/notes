# Notes Blog — Web Service

Local management server and static site generator for the notes knowledge base.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | ≥ 3.10 | [python.org](https://www.python.org/downloads/) |
| Node.js | ≥ 20.19 | [nodejs.org](https://nodejs.org/) |
| uv | latest | `pip install uv` |

## Quick Start

### 1. Install dependencies

```bash
# Python backend
cd .webservice/manage-site
uv sync

# Vue frontend
cd ../vue-sites
npm install
```

### 2. Launch the management server

**Windows (GUI):** Double-click `.webservice/manage-site/NotesBlogManager.exe`

**Windows (script):** Run `.webservice/manage-site/start.bat`

**Linux / macOS:**
```bash
cd .webservice/manage-site
./start.sh
```

**Manual:**
```bash
cd .webservice/manage-site
uv run server.py
```

Open **http://127.0.0.1:8765** in your browser.

### 3. Build the static site

From the web UI: go to **Build & Deploy** → click **Build Site**. Output lands in `docs/` at the repository root.

Or from the command line:

```bash
# Windows
.webservice/manage-site/build.bat

# Linux / macOS
cd .webservice/manage-site
./build.sh
```

### 4. Deploy to GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: your default branch, folder: `/docs`
5. Save. Your site will be live at `https://<username>.github.io/<repo>/`

## Configuration

Edit `.webservice/config.json` to change server settings:

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8765
  },
  "site": {
    "title": "My Notes",
    "base": "/notes/",
    "repo_url": "https://github.com/your-username/your-repo"
  }
}
```

- `server.host` / `server.port` — where the management dashboard listens
- `site.base` — must match your GitHub Pages repository name (e.g. `/notes/`)
- `site.repo_url` — link to your GitHub repository

## Project Structure

```
repo-root/                          # Your notes repository
├── *.md                            # Markdown notes (content)
├── PythonPackages/                 # Additional notes
├── figure/                         # Images
├── docs/                           # Built static site (GitHub Pages source)
└── .webservice/                    # Web service (this directory)
    ├── config.json                 # Server configuration
    ├── README.md                   # This file
    ├── manage-site/                # Python management server
    │   ├── server.py               # FastAPI backend
    │   ├── launcher.py             # Tkinter GUI launcher
    │   ├── index.html              # Management web UI
    │   ├── pyproject.toml          # Python dependencies
    │   ├── start.bat / start.sh    # Startup scripts
    │   └── build.bat / build.sh    # Build scripts
    └── vue-sites/                  # Vue + Vite frontend
        ├── src/                    # Vue components & content
        ├── scripts/                # Build helper scripts
        ├── vite.config.js          # Vite configuration
        └── package.json            # Node dependencies
```

## Troubleshooting

**Server won't start:** Make sure port 8765 is not in use. Change it in `.webservice/config.json`.

**Build fails:** Check that Node.js is installed (`node --version`). The build runs `npm run build` inside `.webservice/vue-sites/`.

**"uv not found":** Install uv with `pip install uv`, or use `python -m pip install uv`.

**GitHub Pages blank page:** Verify `site.base` in config.json matches your repository name exactly (case-sensitive).
