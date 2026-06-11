r"""
Notes Blog — GUI Launcher
Start/stop the management server with visual controls.
Run with: .venv\Scripts\python.exe launcher.py
"""

import subprocess
import sys
import os
import threading
import time
import webbrowser
from pathlib import Path

# Check for tkinter early (included with Python on Windows by default)
try:
    import tkinter as tk
    from tkinter import ttk, scrolledtext
except ImportError:
    # If running in a console without tkinter, show an error and exit
    print("=" * 56)
    print("  ERROR: tkinter is not available.")
    print("  The GUI launcher requires Python with tkinter support.")
    print(f"  Python: {sys.executable}")
    print("=" * 56)
    # Fallback: run the server directly in console mode
    print("\nFalling back to console mode (Ctrl+C to stop)...")
    print(f"Starting server at http://127.0.0.1:8765")
    import runpy
    server_py = Path(__file__).resolve().parent / "server.py"
    sys.argv = [str(server_py)]
    runpy.run_path(str(server_py), run_name="__main__")
    sys.exit(0)

# ── Paths ─────────────────────────────────────────────────────────
# When running as PyInstaller EXE, __file__ is in _MEIPASS (temp dir).
# Use sys.executable to find the original EXE location, which sits next to server.py.
IS_FROZEN = getattr(sys, "frozen", False)
if IS_FROZEN:
    MANAGE_DIR = Path(sys.executable).resolve().parent
else:
    MANAGE_DIR = Path(__file__).resolve().parent

SERVER_PY = MANAGE_DIR / "server.py"

# Prefer pythonw.exe on Windows — no console window for the server process
_PYTHONW = MANAGE_DIR / ".venv" / "Scripts" / "pythonw.exe"
_PYTHON = MANAGE_DIR / ".venv" / "Scripts" / "python.exe"

if _PYTHONW.exists():
    VENV_PYTHON = _PYTHONW
elif _PYTHON.exists():
    VENV_PYTHON = _PYTHON
else:
    # Fall back to system python
    VENV_PYTHON = sys.executable


class ServerLauncher:
    def __init__(self):
        self.root = None
        self.status_label = None
        self.log_text = None
        self.start_btn = None
        self.stop_btn = None
        self.open_btn = None
        self.server_proc: subprocess.Popen | None = None
        self.log_lines: list[str] = []
        self.running = False
        self.owns_server = False  # True if we started the server process
        self.host = "127.0.0.1"
        self.port = 8765

    # ── UI Setup ──────────────────────────────────────────────────
    def setup_ui(self):
        self.root = root = tk.Tk()
        root.title("Notes Blog — Management Server")
        root.geometry("640x480")
        root.minsize(480, 360)
        root.configure(bg="#1e1e2e")

        # ── Title bar ─────────────────────────────────────────────
        title_frame = tk.Frame(root, bg="#181825", height=48)
        title_frame.pack(fill="x")
        title_frame.pack_propagate(False)

        tk.Label(
            title_frame, text="📓  Notes Blog Manager",
            fg="#cdd6f4", bg="#181825",
            font=("Segoe UI", 13, "bold"),
        ).pack(side="left", padx=16, pady=10)

        # ── Status bar ────────────────────────────────────────────
        status_frame = tk.Frame(root, bg="#313244", height=36)
        status_frame.pack(fill="x", padx=12, pady=(12, 0))
        status_frame.pack_propagate(False)

        self.status_dot = tk.Canvas(status_frame, width=14, height=14,
                                     bg="#313244", highlightthickness=0)
        self.status_dot.pack(side="left", padx=(14, 6), pady=11)
        self._dot = self.status_dot.create_oval(2, 2, 12, 12, fill="#a6adc8", outline="")

        self.status_label = tk.Label(
            status_frame, text="Server stopped",
            fg="#a6adc8", bg="#313244",
            font=("Segoe UI", 10),
        )
        self.status_label.pack(side="left", pady=11)

        self.url_label = tk.Label(
            status_frame, text="",
            fg="#89b4fa", bg="#313244",
            font=("Segoe UI", 9, "underline"),
            cursor="hand2",
        )
        self.url_label.pack(side="right", padx=14, pady=11)
        self.url_label.bind("<Button-1>", lambda e: webbrowser.open(f"http://{self.host}:{self.port}"))

        # ── Buttons ───────────────────────────────────────────────
        btn_frame = tk.Frame(root, bg="#1e1e2e")
        btn_frame.pack(fill="x", padx=12, pady=10)

        btn_style = {
            "font": ("Segoe UI", 10, "bold"),
            "relief": "flat",
            "bd": 0,
            "padx": 20,
            "pady": 7,
            "width": 10,
        }

        self.start_btn = tk.Button(
            btn_frame, text="▶  启动服务器",
            fg="#1e1e2e", bg="#a6e3a1", activebackground="#94d89c",
            activeforeground="#1e1e2e",
            command=self.start_server, **btn_style,
        )
        self.start_btn.pack(side="left", padx=(0, 8))

        self.stop_btn = tk.Button(
            btn_frame, text="⏹  停止服务器",
            fg="#cdd6f4", bg="#45475a", activebackground="#585b70",
            activeforeground="#cdd6f4",
            command=self.stop_server, state="disabled", **btn_style,
        )
        self.stop_btn.pack(side="left", padx=(0, 8))

        self.open_btn = tk.Button(
            btn_frame, text="🌐  打开网页",
            fg="#cdd6f4", bg="#45475a", activebackground="#585b70",
            activeforeground="#cdd6f4",
            command=lambda: webbrowser.open(f"http://{self.host}:{self.port}"),
            state="disabled", **btn_style,
        )
        self.open_btn.pack(side="left")

        # Deploy button
        self.deploy_btn = tk.Button(
            btn_frame, text="🚀 Deploy",
            fg="#1e1e2e", bg="#f9e2af", activebackground="#f5d88a",
            activeforeground="#1e1e2e",
            command=self.deploy,
            **btn_style,
        )
        self.deploy_btn.pack(side="right", padx=(0, 8))

        # Build button
        self.build_btn = tk.Button(
            btn_frame, text="🔨 Build",
            fg="#cdd6f4", bg="#45475a", activebackground="#585b70",
            activeforeground="#cdd6f4",
            command=self.trigger_build,
            state="disabled", **btn_style,
        )
        self.build_btn.pack(side="right")

        # ── Log area ──────────────────────────────────────────────
        log_label = tk.Label(
            root, text="Server Log",
            fg="#a6adc8", bg="#1e1e2e",
            font=("Segoe UI", 9), anchor="w",
        )
        log_label.pack(fill="x", padx=14, pady=(8, 2))

        self.log_text = scrolledtext.ScrolledText(
            root, bg="#11111b", fg="#cdd6f4",
            insertbackground="#cdd6f4",
            font=("Cascadia Code", 9),
            relief="flat", bd=0,
            wrap="word",
            state="disabled",
        )
        self.log_text.pack(fill="both", expand=True, padx=12, pady=(0, 12))

        # Configure scrollbar colors
        self.log_text.vbar.configure(
            bg="#45475a", troughcolor="#1e1e2e",
            activebackground="#585b70", bd=0,
        )

        # ── Close handler ─────────────────────────────────────────
        root.protocol("WM_DELETE_WINDOW", self.on_close)

    # ── Logging ───────────────────────────────────────────────────
    def log(self, text: str):
        self.log_lines.append(text)
        if self.log_text:
            self.log_text.configure(state="normal")
            self.log_text.insert("end", text + "\n")
            self.log_text.see("end")
            self.log_text.configure(state="disabled")
        print(text)

    # ── Server control ────────────────────────────────────────────
    def _port_in_use(self):
        """Check if the server port is already listening."""
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        try:
            s.connect((self.host, self.port))
            s.close()
            return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False

    def start_server(self):
        if self.running:
            return

        # Check if server is already running on this port
        if self._port_in_use():
            self.log(f"── Server already running at http://{self.host}:{self.port} ──")
            self.running = True
            self.owns_server = False  # we didn't start it, can't stop it
            self.set_status("running")
            # Open browser after a short delay
            threading.Thread(target=self._delayed_open_browser, daemon=True).start()
            return

        self.log("── Starting server... ──")
        self.set_status("starting")

        try:
            env = os.environ.copy()
            env["PYTHONIOENCODING"] = "utf-8"

            # CREATE_NO_WINDOW + pythonw.exe = no console on taskbar
            popen_kw = dict(
                cwd=str(MANAGE_DIR),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                text=True, encoding="utf-8", errors="replace",
                env=env,
            )
            if sys.platform == "win32":
                popen_kw["creationflags"] = subprocess.CREATE_NO_WINDOW  # 0x08000000

            self.server_proc = subprocess.Popen(
                [str(VENV_PYTHON), "-u", str(SERVER_PY)],
                **popen_kw,
            )

            self.running = True
            self.owns_server = True
            self.set_status("running")
            self.log(f"Server starting at http://{self.host}:{self.port}")

            # Open browser after a short delay
            threading.Thread(target=self._delayed_open_browser, daemon=True).start()

            # Read stdout in background thread
            threading.Thread(target=self._read_stdout, daemon=True).start()

            # Monitor process in background
            threading.Thread(target=self._monitor_process, daemon=True).start()

        except Exception as e:
            self.log(f"ERROR: Failed to start server: {e}")
            self.set_status("stopped")

    def stop_server(self):
        if not self.running:
            return

        # If we didn't start the server, we can't stop it from here
        if not self.owns_server:
            self.log("── This server was not started by the launcher. ──")
            self.log(f"    To stop it, close the terminal or run: taskkill /f /im python.exe")
            self.running = False
            self.set_status("stopped")
            return

        if not self.server_proc:
            return

        self.log("── Stopping server... ──")
        self.set_status("stopping")

        try:
            # Graceful termination
            self.server_proc.terminate()
            try:
                self.server_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server_proc.kill()
                self.server_proc.wait()
        except Exception as e:
            self.log(f"Warning during shutdown: {e}")

        self.running = False
        self.server_proc = None
        self.owns_server = False
        self.set_status("stopped")
        self.log("Server stopped.")

    def trigger_build(self):
        """Send a build request via the management API."""
        import urllib.request
        import urllib.error
        self.log("── Triggering build via API... ──")
        try:
            req = urllib.request.Request(
                f"http://{self.host}:{self.port}/api/build",
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=5)
            data = resp.read().decode()
            self.log(f"Build trigger response: {data}")
        except urllib.error.URLError as e:
            self.log(f"ERROR: Cannot reach server — is it running? ({e})")
        except Exception as e:
            self.log(f"ERROR: Build trigger failed: {e}")

    def deploy(self):
        """Run git add/commit/push in the notes root directory."""
        notes_root = MANAGE_DIR.parent.parent  # d:\notes
        self.log("── Deploy: git add . ──")
        self.deploy_btn.configure(state="disabled", text="⏳ Deploying...")
        threading.Thread(target=self._deploy_thread, args=(notes_root,), daemon=True).start()

    def _deploy_thread(self, notes_root):
        import time as _time
        commands = [
            (["git", "add", "."], "git add ."),
            (["git", "commit", "-m", "update"], "git commit -m update"),
            (["git", "push"], "git push"),
        ]
        for cmd_args, label in commands:
            self.root.after(0, self.log, f"  $ {label}")
            try:
                run_kw = dict(
                    cwd=str(notes_root),
                    capture_output=True, text=True, encoding="utf-8", errors="replace",
                    timeout=60,
                )
                if sys.platform == "win32":
                    run_kw["creationflags"] = subprocess.CREATE_NO_WINDOW
                result = subprocess.run(cmd_args, **run_kw)
                output = (result.stdout + result.stderr).strip()
                if output:
                    for line in output.split("\n"):
                        if line.strip():
                            self.root.after(0, self.log, f"    {line.strip()}")
                if result.returncode != 0:
                    # "nothing to commit" is not a real failure
                    if "nothing to commit" in output:
                        self.root.after(0, self.log, "  ── Nothing to commit, working tree clean ──")
                        self.root.after(0, self._deploy_done, True)
                        return
                    self.root.after(0, self.log, f"  ⚠ {label} exited with code {result.returncode}")
                    self.root.after(0, self._deploy_done, False)
                    return
            except subprocess.TimeoutExpired:
                self.root.after(0, self.log, f"  ⚠ {label} timed out")
                self.root.after(0, self._deploy_done, False)
                return
            except Exception as e:
                self.root.after(0, self.log, f"  ⚠ {label} error: {e}")
                self.root.after(0, self._deploy_done, False)
                return
        self.root.after(0, self.log, "── Deploy complete ──")
        self.root.after(0, self._deploy_done, True)

    def _deploy_done(self, success):
        self.deploy_btn.configure(state="normal", text="🚀 Deploy")

    # ── Helpers ───────────────────────────────────────────────────
    def _delayed_open_browser(self):
        time.sleep(2)
        webbrowser.open(f"http://{self.host}:{self.port}")

    def _read_stdout(self):
        """Continuously read server stdout and log it."""
        try:
            while self.running and self.server_proc and self.server_proc.stdout:
                line = self.server_proc.stdout.readline()
                if not line:
                    break
                line = line.rstrip()
                if line:
                    # Schedule log update on the main thread
                    if self.root:
                        self.root.after(0, self.log, line)
        except (ValueError, OSError):
            pass

    def _monitor_process(self):
        """Watch for unexpected server exit."""
        if self.server_proc:
            self.server_proc.wait()
        if self.running:
            self.running = False
            if self.root:
                self.root.after(0, self._on_server_died)

    def _on_server_died(self):
        self.log("── Server process exited unexpectedly ──")
        self.set_status("stopped")
        self.server_proc = None
        self.owns_server = False

    def set_status(self, state: str):
        """Update the UI status indicator."""
        if not self.root:
            return

        colors = {
            "running": ("#a6e3a1", "Server running"),
            "stopped": ("#a6adc8", "Server stopped"),
            "starting": ("#f9e2af", "Server starting..."),
            "stopping": ("#f9e2af", "Server stopping..."),
        }
        color, text = colors.get(state, colors["stopped"])

        if self.status_dot:
            self.status_dot.itemconfig(self._dot, fill=color)
        if self.status_label:
            self.status_label.configure(text=text)

        url = f"http://{self.host}:{self.port}"
        if state == "running":
            if self.url_label:
                self.url_label.configure(text=url)
            if self.start_btn:
                self.start_btn.configure(state="disabled", bg="#585b70", fg="#a6adc8")
            if self.stop_btn:
                self.stop_btn.configure(state="normal", bg="#f38ba8", fg="#1e1e2e")
            if self.open_btn:
                self.open_btn.configure(state="normal", bg="#89b4fa", fg="#1e1e2e")
            if self.build_btn:
                self.build_btn.configure(state="normal")
        else:
            if self.url_label:
                self.url_label.configure(text="")
            if self.start_btn:
                self.start_btn.configure(state="normal", bg="#a6e3a1", fg="#1e1e2e")
            if self.stop_btn:
                self.stop_btn.configure(state="disabled", bg="#45475a", fg="#a6adc8")
            if self.open_btn:
                self.open_btn.configure(state="disabled", bg="#45475a", fg="#a6adc8")
            if self.build_btn:
                self.build_btn.configure(state="disabled")

    def on_close(self):
        """Handle window close button."""
        if self.running:
            self.stop_server()
        if self.root:
            self.root.destroy()


# ── Bootstrap ─────────────────────────────────────────────────────
def ensure_venv():
    """If .venv doesn't exist, run uv sync to create it."""
    if VENV_PYTHON.exists():
        return True, ""
    if IS_FROZEN:
        # Can't show messagebox yet — no root window
        print("Virtual environment not found. Running 'uv sync'...")
    try:
        run_kw = dict(
            cwd=str(MANAGE_DIR),
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=120,
        )
        if sys.platform == "win32":
            run_kw["creationflags"] = subprocess.CREATE_NO_WINDOW
        result = subprocess.run(["uv", "sync"], **run_kw)
        if result.returncode != 0:
            return False, result.stderr or result.stdout
        return VENV_PYTHON.exists(), result.stderr or result.stdout
    except FileNotFoundError:
        return False, "uv is not installed or not in PATH.\nInstall it with: pip install uv\nhttps://github.com/astral-sh/uv"
    except subprocess.TimeoutExpired:
        return False, "uv sync timed out after 120 seconds."
    except Exception as e:
        return False, str(e)


# ── Main ──────────────────────────────────────────────────────────
def main():
    # Force UTF-8 on Windows (only in console mode — skip for frozen GUI EXE)
    if sys.platform == "win32" and sys.stdout is not None:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

    launcher = ServerLauncher()
    launcher.setup_ui()

    # When running as frozen EXE, always auto-start (the whole point of the EXE)
    # When running as script, auto-start if --autostart flag is passed
    should_autostart = IS_FROZEN or "--autostart" in sys.argv

    if should_autostart:
        if not VENV_PYTHON.exists():
            launcher.log("── First run detected, setting up environment... ──")
            ok, msg = ensure_venv()
            if msg:
                for line in msg.strip().split("\n"):
                    if line.strip():
                        launcher.log(f"  {line.strip()}")
            if not ok:
                launcher.log(f"ERROR: Failed to set up virtual environment:\n{msg}")
                launcher.set_status("stopped")
                launcher.log("── Please run 'uv sync' manually in manage-site/ ──")
                launcher.root.mainloop()
                return
            launcher.log("── Environment ready. ──")

        launcher.root.after(500, launcher.start_server)

    launcher.root.mainloop()


if __name__ == "__main__":
    main()
