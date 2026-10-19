"""
ECOAIR — All-In-One Launcher & Local Server
Opens ECOAIR Urban Air Intelligence Platform on http://localhost:8080
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    print("=" * 70)
    print("🌿 ECOAIR — AI Urban Air Intelligence Platform")
    print("SEE -> UNDERSTAND -> PREDICT -> ACT -> MEASURE")
    print("=" * 70)
    print(f"[1/2] Serving ECOAIR on http://localhost:{PORT} ...")

    Handler = http.server.SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json"
    })

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"[2/2] Opening default browser at http://localhost:{PORT}/index.html ...")
            webbrowser.open(f"http://localhost:{PORT}/index.html")
            print("\nECOAIR Platform is LIVE!")
            print("  • App URL:          http://localhost:8080/index.html")
            print("  • App Map & Tour:   http://localhost:8080/devpost/app-map.html")
            print("  • Operational Loop: SEE -> UNDERSTAND -> PREDICT -> ACT -> MEASURE")
            print("\nPress Ctrl+C to stop the local server cleanly.\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping ECOAIR server... Stopped.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    main()
