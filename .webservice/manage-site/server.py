"""
Notes Blog — Local Management Server

Provides a REST API for managing notes metadata, content, and site build.
Run with: uv run server.py  (or python server.py if venv is active)
"""

import asyncio
import json
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ── Paths ─────────────────────────────────────────────────────────
MANAGE_DIR = Path(__file__).resolve().parent          # .../notes/.webservice/manage-site
NOTES_ROOT = MANAGE_DIR.parent.parent                  # .../notes
VUE_DIR = NOTES_ROOT / ".webservice" / "vue-sites"
DOCS_DIR = NOTES_ROOT / "docs"
METADATA_FILE = VUE_DIR / "src" / "data" / "notes-metadata.json"
CONTENT_DIR = VUE_DIR / "src" / "content" / "notes"

# Subdirectories that contain .md files
MD_SUBDIRS = ["", "PythonPackages"]


# ── Helpers ───────────────────────────────────────────────────────
def load_metadata() -> dict:
    """Load notes-metadata.json."""
    if not METADATA_FILE.exists():
        return {"categories": [], "notes": []}
    return json.loads(METADATA_FILE.read_text(encoding="utf-8"))


def save_metadata(data: dict) -> None:
    """Save notes-metadata.json atomically."""
    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = str(METADATA_FILE) + ".tmp"
    Path(tmp).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    os.replace(tmp, str(METADATA_FILE))


def find_md_files() -> list[dict]:
    """Scan NOTES_ROOT for .md files (excluding readme.md)."""
    files = []
    for subdir in MD_SUBDIRS:
        scan_dir = NOTES_ROOT / subdir if subdir else NOTES_ROOT
        if not scan_dir.exists():
            continue
        for f in sorted(scan_dir.iterdir()):
            if not f.is_file():
                continue
            if f.suffix.lower() != ".md":
                continue
            if f.name.lower() == "readme.md":
                continue
            rel = f"{subdir}/{f.name}" if subdir else f.name
            files.append({
                "filename": rel,
                "name": f.name,
                "path": str(f),
                "size": f.stat().st_size,
                "mtime": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            })
    return files


def get_note_path(filename: str) -> Path:
    """Resolve a metadata filename (e.g. 'PythonPackages/numpy.md') to absolute path."""
    return NOTES_ROOT / filename


def metadata_to_frontend(note: dict) -> dict:
    """Add computed fields for the frontend."""
    fname = note.get("filename", "")
    file_path = NOTES_ROOT / fname
    exists = file_path.exists()
    size = file_path.stat().st_size if exists else 0
    mtime = (
        datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
        if exists
        else None
    )
    return {**note, "_exists": exists, "_size": size, "_mtime": mtime}


# ── App ───────────────────────────────────────────────────────────
app = FastAPI(title="Notes Site Manager", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── API: Stats ────────────────────────────────────────────────────
@app.get("/api/stats")
def get_stats():
    meta = load_metadata()
    md_files = find_md_files()
    registered_filenames = {n["filename"] for n in meta["notes"]}
    unregistered = [f for f in md_files if f["filename"] not in registered_filenames]

    return {
        "total_notes": len(meta["notes"]),
        "categories": len(meta.get("categories", [])),
        "md_files_on_disk": len(md_files),
        "unregistered": len(unregistered),
        "unregistered_files": unregistered,
        "last_build": (
            datetime.fromtimestamp(DOCS_DIR.stat().st_mtime).isoformat()
            if DOCS_DIR.exists()
            else None
        ),
    }


# ── API: Categories ───────────────────────────────────────────────
@app.get("/api/categories")
def get_categories():
    return load_metadata().get("categories", [])


@app.post("/api/categories")
def create_category(data: dict):
    """Create a new category. Required: id, name. Optional: icon."""
    if not data.get("id") or not data.get("name"):
        raise HTTPException(400, "Missing required fields: id, name")
    meta = load_metadata()
    for c in meta.get("categories", []):
        if c["id"] == data["id"]:
            raise HTTPException(409, f"Category '{data['id']}' already exists")
    new_cat = {
        "id": data["id"].strip().lower().replace(" ", "-"),
        "name": data["name"].strip(),
        "icon": data.get("icon", "📝"),
    }
    meta.setdefault("categories", []).append(new_cat)
    save_metadata(meta)
    return {"ok": True, "category": new_cat}


@app.put("/api/categories/{cat_id}")
def update_category(cat_id: str, data: dict):
    """Update a category's name and/or icon."""
    meta = load_metadata()
    for c in meta.get("categories", []):
        if c["id"] == cat_id:
            if "name" in data:
                c["name"] = data["name"].strip()
            if "icon" in data:
                c["icon"] = data["icon"]
            save_metadata(meta)
            return {"ok": True, "category": c}
    raise HTTPException(404, f"Category '{cat_id}' not found")


@app.delete("/api/categories/{cat_id}")
def delete_category(cat_id: str, reassign_to: str = Query(None)):
    """
    Delete a category. If notes exist in this category, `reassign_to` is required
    to move those notes to another category.
    """
    meta = load_metadata()
    cats = meta.get("categories", [])
    target = next((c for c in cats if c["id"] == cat_id), None)
    if not target:
        raise HTTPException(404, f"Category '{cat_id}' not found")

    # Count notes in this category
    notes_in_cat = [n for n in meta["notes"] if n.get("category") == cat_id]
    if notes_in_cat:
        if not reassign_to:
            raise HTTPException(
                400,
                f"{len(notes_in_cat)} notes belong to '{cat_id}'. "
                "Provide ?reassign_to=<category_id> to move them.",
            )
        if not any(c["id"] == reassign_to for c in cats):
            raise HTTPException(404, f"Reassign target category '{reassign_to}' not found")
        for n in notes_in_cat:
            n["category"] = reassign_to

    meta["categories"] = [c for c in cats if c["id"] != cat_id]
    save_metadata(meta)
    return {"ok": True, "deleted": cat_id, "reassigned": len(notes_in_cat)}


@app.put("/api/categories")
def update_categories_bulk(data: list[dict]):
    """Replace all categories at once."""
    meta = load_metadata()
    meta["categories"] = data
    save_metadata(meta)
    return {"ok": True, "categories": data}


# ── API: Notes List ───────────────────────────────────────────────
@app.get("/api/notes")
def list_notes(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    meta = load_metadata()
    notes = meta["notes"]
    if category:
        notes = [n for n in notes if n.get("category") == category]
    if search:
        q = search.lower()
        notes = [
            n
            for n in notes
            if q in n.get("title", "").lower()
            or q in n.get("description", "").lower()
            or q in n.get("slug", "").lower()
        ]
    return [metadata_to_frontend(n) for n in notes]


# ── API: Single Note ──────────────────────────────────────────────
@app.get("/api/notes/{slug}")
def get_note(slug: str):
    meta = load_metadata()
    for n in meta["notes"]:
        if n["slug"] == slug:
            data = metadata_to_frontend(n)
            # Load content
            fpath = get_note_path(n["filename"])
            if fpath.exists():
                data["content"] = fpath.read_text(encoding="utf-8")
            else:
                data["content"] = ""
            return data
    raise HTTPException(404, f"Note with slug '{slug}' not found")


# ── API: Create Note ──────────────────────────────────────────────
@app.post("/api/notes")
def create_note(data: dict):
    """
    Create a new note entry in metadata.
    Required fields: slug, filename, title, category
    """
    required = ["slug", "filename", "title", "category"]
    for field in required:
        if not data.get(field):
            raise HTTPException(400, f"Missing required field: {field}")

    meta = load_metadata()

    # Check uniqueness
    for n in meta["notes"]:
        if n["slug"] == data["slug"]:
            raise HTTPException(409, f"Slug '{data['slug']}' already exists")
        if n["filename"] == data["filename"]:
            raise HTTPException(409, f"Filename '{data['filename']}' already registered")

    new_note = {
        "slug": data["slug"],
        "filename": data["filename"],
        "title": data["title"],
        "category": data["category"],
        "description": data.get("description", ""),
        "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
    }
    meta["notes"].append(new_note)
    save_metadata(meta)

    # If content was provided, write it to the .md file
    if data.get("content"):
        fpath = get_note_path(data["filename"])
        fpath.parent.mkdir(parents=True, exist_ok=True)
        fpath.write_text(data["content"], encoding="utf-8")

    return metadata_to_frontend(new_note)


# ── API: Update Note ──────────────────────────────────────────────
@app.put("/api/notes/{slug}")
def update_note(slug: str, data: dict):
    """
    Update note metadata and/or content.
    Send { metadata: {...}, content: "..." } or just one of them.
    """
    meta = load_metadata()
    for i, n in enumerate(meta["notes"]):
        if n["slug"] == slug:
            old_filename = n["filename"]

            # Update metadata
            if "metadata" in data:
                for k, v in data["metadata"].items():
                    if k in ("slug", "filename", "title", "category", "description", "date"):
                        n[k] = v
                meta["notes"][i] = n
                save_metadata(meta)

            # Update content
            if "content" in data:
                fname = n.get("filename", old_filename)
                fpath = get_note_path(fname)
                fpath.parent.mkdir(parents=True, exist_ok=True)
                fpath.write_text(data["content"], encoding="utf-8")

            return metadata_to_frontend(n)

    raise HTTPException(404, f"Note with slug '{slug}' not found")


# ── API: Delete Note ──────────────────────────────────────────────
@app.delete("/api/notes/{slug}")
def delete_note(slug: str, delete_file: bool = Query(False)):
    """
    Remove note from metadata. If delete_file=true, also delete the .md file.
    """
    meta = load_metadata()
    for i, n in enumerate(meta["notes"]):
        if n["slug"] == slug:
            removed = meta["notes"].pop(i)
            save_metadata(meta)

            if delete_file:
                fpath = get_note_path(removed["filename"])
                if fpath.exists():
                    fpath.unlink()

            return {"ok": True, "deleted": removed["slug"]}

    raise HTTPException(404, f"Note with slug '{slug}' not found")


# ── API: Scan Unregistered ────────────────────────────────────────
@app.get("/api/scan")
def scan_unregistered():
    """Find .md files on disk that aren't in metadata."""
    meta = load_metadata()
    registered = {n["filename"] for n in meta["notes"]}
    all_md = find_md_files()
    unregistered = [f for f in all_md if f["filename"] not in registered]
    return {
        "unregistered": unregistered,
        "count": len(unregistered),
        "registered_count": len(registered),
        "total_on_disk": len(all_md),
    }


# ── API: Read raw file ────────────────────────────────────────────
@app.get("/api/raw-file")
def read_raw_file(path: str = Query(...)):
    """Read any file in NOTES_ROOT by relative path (for preview)."""
    full = (NOTES_ROOT / path).resolve()
    if not str(full).startswith(str(NOTES_ROOT.resolve())):
        raise HTTPException(403, "Path traversal denied")
    if not full.exists():
        raise HTTPException(404, "File not found")
    return {
        "path": path,
        "content": full.read_text(encoding="utf-8"),
        "size": full.stat().st_size,
    }


# ── API: Site Config ──────────────────────────────────────────────
CONFIG_PATH = MANAGE_DIR.parent / "config.json"

def _load_config():
    """Load config.json, returning defaults if missing/invalid."""
    defaults = {
        "server": {"host": "127.0.0.1", "port": 8765},
        "site": {"title": "My Notes", "description": "", "base": "/notes/", "repo_url": ""},
    }
    if CONFIG_PATH.exists():
        try:
            cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            # Merge with defaults so missing keys don't break things
            for section in defaults:
                if section in cfg:
                    defaults[section].update(cfg[section])
            return defaults
        except Exception:
            pass
    return defaults


@app.get("/api/site-config")
def get_site_config():
    """Return site-level config for display (read from config.json)."""
    cfg = _load_config()
    return {
        "title": cfg["site"].get("title", "My Notes"),
        "base_path": cfg["site"].get("base", "/notes/"),
        "repo_url": cfg["site"].get("repo_url", ""),
        "build_output_dir": str(DOCS_DIR),
        "vue_project_dir": str(VUE_DIR),
        "notes_dir": str(NOTES_ROOT),
    }


@app.get("/api/config")
def get_config():
    """Return the full config.json contents."""
    return _load_config()


@app.post("/api/config")
def save_config(data: dict):
    """Save the full config.json."""
    # Validate structure
    if "server" not in data:
        data["server"] = {}
    if "site" not in data:
        data["site"] = {}
    # Basic validation
    host = data["server"].get("host", "127.0.0.1")
    port = int(data["server"].get("port", 8765))
    if not (1 <= port <= 65535):
        raise HTTPException(400, "Port must be between 1 and 65535")
    data["server"]["host"] = host
    data["server"]["port"] = port
    data["site"]["title"] = data["site"].get("title", "My Notes")
    data["site"]["base"] = data["site"].get("base", "/notes/")
    data["site"]["repo_url"] = data["site"].get("repo_url", "")
    data["site"]["description"] = data["site"].get("description", "")
    # Preserve favicon if present in incoming data, otherwise keep existing
    if "favicon" in data["site"]:
        data["site"]["favicon"] = data["site"]["favicon"]
    else:
        old_cfg = _load_config()
        if "favicon" in old_cfg.get("site", {}):
            data["site"]["favicon"] = old_cfg["site"]["favicon"]
    # Write atomically
    tmp = str(CONFIG_PATH) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, str(CONFIG_PATH))
    return {"ok": True, "message": "Config saved. Restart the server for host/port changes to take effect."}


@app.post("/api/config/favicon")
async def upload_favicon(file: UploadFile = File(...)):
    """Upload a favicon image. Accepts PNG, JPG, ICO, SVG."""
    # Validate file type
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    allowed = {".png", ".jpg", ".jpeg", ".ico", ".svg", ".webp"}
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported format: {ext}. Allowed: {', '.join(sorted(allowed))}")

    # Limit size (1 MB)
    contents = await file.read()
    if len(contents) > 1_000_000:
        raise HTTPException(400, "File too large. Max 1 MB.")

    # Determine the favicon filename. ICO is the traditional favicon; browsers
    # also accept PNG. We always save as favicon.ico for maximum compatibility
    # unless it's an SVG, which we save as favicon.svg.
    if ext == ".svg":
        favicon_name = "favicon.svg"
    elif ext == ".ico":
        favicon_name = "favicon.ico"
    else:
        # Convert PNG/JPG/WebP → save as favicon.ico name (browsers probe content-type anyway)
        favicon_name = "favicon.ico"

    favicon_dir = VUE_DIR / "public"
    favicon_dir.mkdir(parents=True, exist_ok=True)
    favicon_path = favicon_dir / favicon_name
    favicon_path.write_bytes(contents)

    # Update config.json with favicon path
    cfg = _load_config()
    cfg["site"]["favicon"] = f"./{favicon_name}"
    tmp = str(CONFIG_PATH) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)
    os.replace(tmp, str(CONFIG_PATH))

    return {"ok": True, "message": f"Favicon saved as {favicon_name}. Rebuild the site to apply.", "favicon": f"./{favicon_name}"}


# ── API: Build ────────────────────────────────────────────────────
# We keep build state in memory for SSE streaming
_build_lock = asyncio.Lock()
_build_state: dict = {"running": False, "log": [], "result": None}
_deploy_state: dict = {"running": False, "log": [], "result": None}


def copy_notes_sync(log_cb):
    """Python implementation of copy-notes.js — no Node.js required."""
    import shutil as sh
    content_dir = VUE_DIR / "src" / "content" / "notes"
    public_figure_dir = VUE_DIR / "public" / "figure"
    content_dir.mkdir(parents=True, exist_ok=True)
    public_figure_dir.mkdir(parents=True, exist_ok=True)

    # Copy root .md files (exclude readme.md)
    for f in sorted(NOTES_ROOT.iterdir()):
        if not f.is_file():
            continue
        if f.suffix.lower() != ".md":
            continue
        if f.name.lower() == "readme.md":
            continue
        sh.copy2(str(f), str(content_dir / f.name))
        log_cb(f"  ✓ {f.name}")

    # Copy PythonPackages directory
    pkg_dir = NOTES_ROOT / "PythonPackages"
    if pkg_dir.exists():
        pkg_target = content_dir / "PythonPackages"
        pkg_target.mkdir(parents=True, exist_ok=True)
        for f in sorted(pkg_dir.iterdir()):
            if f.is_file() and f.suffix.lower() == ".md":
                sh.copy2(str(f), str(pkg_target / f.name))
                log_cb(f"  ✓ PythonPackages/{f.name}")

    # Copy figure directory
    figure_dir = NOTES_ROOT / "figure"
    if figure_dir.exists():
        for f in sorted(figure_dir.iterdir()):
            if f.is_file():
                sh.copy2(str(f), str(public_figure_dir / f.name))
                log_cb(f"  ✓ figure/{f.name}")

    log_cb("Done copying notes and figures.")


def copy_404_sync(log_cb):
    """Python implementation of copy-404.js."""
    index_path = DOCS_DIR / "index.html"
    not_found_path = DOCS_DIR / "404.html"
    if index_path.exists():
        shutil.copy2(str(index_path), str(not_found_path))
        log_cb("✓ Created 404.html for GitHub Pages SPA support")
    else:
        log_cb("⚠ index.html not found in docs/ — did build succeed?")


async def run_build():
    """Run build: Python copy steps + direct vite subprocess (avoids cmd /c nesting)."""
    global _build_state
    _build_state = {"running": True, "log": [], "result": None}

    import concurrent.futures

    def _log(text):
        _build_state["log"].append({"ts": time.time(), "text": text})

    def _run():
        global _build_state
        try:
            is_win = sys.platform == "win32"

            _log(f"-- Build started ({'Windows' if is_win else 'Unix'}) --")

            # Step 1: Copy notes (Python)
            _log("-- Step 1/3: copy-notes --")
            copy_notes_sync(_log)

            # Step 2: Vite build (the only Node.js subprocess left)
            _log("-- Step 2/3: vite build --")
            vue_dir = str(VUE_DIR)
            if is_win:
                vite_cmd = [str(VUE_DIR / "node_modules" / ".bin" / "vite.cmd"), "build"]
            else:
                vite_cmd = [str(VUE_DIR / "node_modules" / ".bin" / "vite"), "build"]

            popen_kw = dict(
                cwd=vue_dir,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                text=True, encoding="utf-8", errors="replace",
            )
            if sys.platform == "win32":
                popen_kw["creationflags"] = subprocess.CREATE_NO_WINDOW
            proc = subprocess.Popen(vite_cmd, **popen_kw)
            for line in proc.stdout:
                line = line.rstrip()
                if line:
                    _log(line)
            proc.wait()

            if proc.returncode != 0:
                raise RuntimeError(f"vite build exited with code {proc.returncode}")

            # Step 3: Copy 404 (Python)
            _log("-- Step 3/3: copy-404 --")
            copy_404_sync(_log)

            _build_state["result"] = {"success": True, "code": 0}
            _log("\n-- Build SUCCESS -- Deployed to docs/ --")
        except Exception as exc:
            _build_state["result"] = {"success": False, "error": str(exc)}
            _log(f"\n-- Build FAILED: {exc} --")
            _log("Tip: You can also run build.bat directly in File Explorer.")
        finally:
            _build_state["running"] = False

    pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    pool.submit(_run)
    pool.shutdown(wait=False)


@app.post("/api/build")
async def trigger_build():
    """Start a build. Returns immediately; stream output via /api/build/stream."""
    if _build_state["running"]:
        return {"ok": False, "error": "Build already running"}

    asyncio.create_task(run_build())
    return {"ok": True, "message": "Build started"}


@app.get("/api/build/status")
def build_status():
    """Poll build status."""
    return {
        "running": _build_state["running"],
        "result": _build_state["result"],
        "log_length": len(_build_state["log"]),
    }


@app.get("/api/build/stream")
async def build_stream(since: int = Query(0, description="Last log index seen")):
    """SSE stream for live build output."""
    async def event_generator():
        last_idx = since
        while True:
            current_len = len(_build_state["log"])
            while last_idx < current_len:
                entry = _build_state["log"][last_idx]
                yield f"data: {json.dumps(entry)}\n\n"
                last_idx += 1

            if not _build_state["running"] and last_idx >= len(_build_state["log"]):
                yield f"event: done\ndata: {json.dumps(_build_state['result'] or {})}\n\n"
                break

            await asyncio.sleep(0.3)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── Deploy (git add/commit/push in notes root) ────────────────────

@app.post("/api/deploy")
async def trigger_deploy():
    """Start a git deploy. Returns immediately; stream output via /api/deploy/stream."""
    if _deploy_state["running"]:
        return {"ok": False, "error": "Deploy already running"}

    asyncio.create_task(run_deploy())
    return {"ok": True, "message": "Deploy started"}


@app.get("/api/deploy/status")
def deploy_status():
    """Poll deploy status."""
    return {
        "running": _deploy_state["running"],
        "result": _deploy_state["result"],
        "log_length": len(_deploy_state["log"]),
    }


@app.get("/api/deploy/stream")
async def deploy_stream(since: int = Query(0, description="Last log index seen")):
    """SSE stream for live deploy output."""
    async def event_generator():
        last_idx = since
        while True:
            current_len = len(_deploy_state["log"])
            while last_idx < current_len:
                entry = _deploy_state["log"][last_idx]
                yield f"data: {json.dumps(entry)}\n\n"
                last_idx += 1

            if not _deploy_state["running"] and last_idx >= len(_deploy_state["log"]):
                yield f"event: done\ndata: {json.dumps(_deploy_state['result'] or {})}\n\n"
                break

            await asyncio.sleep(0.3)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


async def run_deploy():
    """Run git add/commit/push in the notes root directory."""
    global _deploy_state
    _deploy_state = {"running": True, "log": [], "result": None}

    import concurrent.futures

    def _log(text):
        _deploy_state["log"].append({"ts": time.time(), "text": text})

    def _run():
        global _deploy_state
        try:
            commands = [
                (["git", "add", "."], "git add ."),
                (["git", "commit", "-m", "update"], "git commit -m update"),
                (["git", "pull", "--rebase"], "git pull --rebase"),
                (["git", "push"], "git push"),
            ]
            for cmd_args, label in commands:
                _log(f"$ {label}")
                run_kw = dict(
                    cwd=str(NOTES_ROOT),
                    capture_output=True, text=True, encoding="utf-8", errors="replace",
                    timeout=60,
                )
                if sys.platform == "win32":
                    run_kw["creationflags"] = subprocess.CREATE_NO_WINDOW
                proc = subprocess.run(cmd_args, **run_kw)
                output = (proc.stdout + proc.stderr).strip()
                if output:
                    for line in output.split("\n"):
                        if line.strip():
                            _log(line.strip())
                if proc.returncode != 0:
                    # "nothing to commit" is not a real failure
                    if "nothing to commit" in output:
                        _log("── Nothing to commit, working tree clean ──")
                        _deploy_state["result"] = {"success": True, "code": 0}
                        return
                    _log(f"⚠ {label} exited with code {proc.returncode}")
                    _deploy_state["result"] = {"success": False, "error": f"{label} failed with code {proc.returncode}"}
                    return

            _deploy_state["result"] = {"success": True, "code": 0}
            _log("── Deploy complete ──")
        except Exception as exc:
            _deploy_state["result"] = {"success": False, "error": str(exc)}
            _log(f"── Deploy FAILED: {exc} ──")
        finally:
            _deploy_state["running"] = False

    pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    pool.submit(_run)
    pool.shutdown(wait=False)


# ── Serve frontend ────────────────────────────────────────────────
FRONTEND_FILE = MANAGE_DIR / "index.html"


@app.get("/")
def serve_frontend():
    """Serve the management page."""
    if FRONTEND_FILE.exists():
        return FileResponse(str(FRONTEND_FILE))
    return JSONResponse({"error": "index.html not found in manage-site/"}, 404)


@app.get("/favicon.png")
def serve_favicon():
    """Serve the management page favicon."""
    favicon_path = MANAGE_DIR / "favicon.png"
    if favicon_path.exists():
        return FileResponse(str(favicon_path), media_type="image/png")
    return Response(status_code=404)


# ── Main ──────────────────────────────────────────────────────────
def main():
    # Force UTF-8 on Windows to avoid emoji encoding errors
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

    # Load config (fall back to defaults if file missing or invalid)
    host = "127.0.0.1"
    port = 8765
    config_path = MANAGE_DIR.parent / "config.json"
    if config_path.exists():
        try:
            cfg = json.loads(config_path.read_text(encoding="utf-8"))
            host = cfg.get("server", {}).get("host", host)
            port = cfg.get("server", {}).get("port", port)
        except Exception:
            pass  # fall back to defaults

    print("=" * 56)
    print("  Notes Blog -- Management Dashboard")
    print("=" * 56)
    print(f"  Notes root : {NOTES_ROOT}")
    print(f"  Metadata   : {METADATA_FILE}")
    print(f"  Vue project: {VUE_DIR}")
    print(f"  Build out  : {DOCS_DIR}")
    print(f"  Config     : {config_path}")
    print("-" * 56)
    print(f"  Open http://{host}:{port} in your browser")
    print("=" * 56)
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
