#!/usr/bin/env python3
"""Local dev server approximating Netlify: clean extensionless URLs serve the
matching .html file; .html requests 301 to the clean path (mirrors _redirects)."""
import http.server, os, sys
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
        if not path.endswith("/") and "." not in os.path.basename(path) and os.path.isfile(cand):
            self.path = "/" + cand
        elif path.endswith("/") and os.path.isfile(cand):
            self.path = "/" + cand
        return super().do_GET()
    def log_message(self, *a): pass
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8125), H).serve_forever()
