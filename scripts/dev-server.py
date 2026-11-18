#!/usr/bin/env python3
"""Local dev server approximating Netlify: clean extensionless URLs serve the
matching .html file; .html requests 301 to the clean path (mirrors _redirects)."""
import argparse, http.server, os
from functools import partial
from pathlib import Path
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0].split("#")[0]
        if path.endswith(".html"):
            clean = "/" if path in ("/index.html",) else ("/es/" if path == "/es/index.html" else path[:-5])
            self.send_response(301); self.send_header("Location", clean); self.end_headers(); return
        if path.endswith("/"):
            cand = path.lstrip("/") + "index.html"
        else:
            cand = path.lstrip("/") + ".html"
        if not path.endswith("/") and "." not in os.path.basename(path) and os.path.isfile(self.translate_path('/' + cand)):
            self.path = "/" + cand
        elif path.endswith("/") and os.path.isfile(self.translate_path('/' + cand)):
            self.path = "/" + cand
        return super().do_GET()
    def log_message(self, *a): pass
args = argparse.ArgumentParser(description=__doc__)
args.add_argument('port', nargs='?', type=int, default=8125)
args.add_argument('--built', action='store_true', help='Serve the deployment output from scripts/build-public.mjs')
options = args.parse_args()
root = Path(__file__).resolve().parent.parent
directory = root / '.site' if options.built else root
http.server.ThreadingHTTPServer(('127.0.0.1', options.port), partial(H, directory=str(directory))).serve_forever()
