import os
from dotenv import load_dotenv
import argparse
from event_watcher_core import fetch_events, find_matching_events, send_email

load_dotenv(override=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Watch for events and send email notifications.")
    parser.add_argument('--dry-run', action='store_true', help="If set, do not send email, just print what would be sent.")
    args = parser.parse_args()

    html = fetch_events()
    keywords = ["hardstyle", "hardcore"]
    matches = find_matching_events(html, keywords)
    if matches:
        send_email(matches, dry_run=args.dry_run)
        print(f"Found {len(matches)} matching events. {'Email sent.' if not args.dry_run else 'No email sent (dry run).'}")
    else:
        print("No matching events found.")