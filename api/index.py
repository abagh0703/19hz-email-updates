from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the parent directory to the path so we can import from event_watcher_core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from event_watcher_core import fetch_events, find_matching_events, send_email

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            keywords = ["hardstyle", "hardcore"]
            html = fetch_events()
            matches = find_matching_events(html, keywords)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            if matches:
                email_result = send_email(matches, dry_run=False)
                response_data = {
                    "message": f"Found {len(matches)} matching events",
                    "email_result": email_result,
                    "events": matches
                }
            else:
                response_data = {
                    "message": "No matching events found",
                    "events": []
                }
            
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_data = {
                "error": str(e),
                "message": "Internal server error"
            }
            self.wfile.write(json.dumps(error_data).encode('utf-8')) 