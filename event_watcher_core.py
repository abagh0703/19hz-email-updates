import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import resend

# Load credentials from environment variables
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_TO = os.environ.get('EMAIL_TO')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
EVENT_URL = 'https://19hz.info/eventlisting_BayArea.php'

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def fetch_events():
    response = requests.get(EVENT_URL)
    response.raise_for_status()
    return response.text

def find_matching_events(html, keywords):
    soup = BeautifulSoup(html, 'html.parser')
    matches = []
    today = datetime.today()
    one_week = today + timedelta(days=7)

    for row in soup.find_all('tr'):
        cells = row.find_all('td')
        if not cells or len(cells) < 7:
            continue

        # Use last column for date, third column for tags
        date_str = cells[6].get_text(separator=' ', strip=True)
        tags_str = cells[2].get_text(separator=' ', strip=True)

        # Parse date (YYYY/MM/DD)
        try:
            event_date = datetime.strptime(date_str, "%Y/%m/%d")
        except ValueError:
            continue  # Skip if date can't be parsed

        if not (today <= event_date <= one_week):
            continue  # Skip events not within a week

        # Match keywords in tags only (case-insensitive)
        tags_lower = tags_str.lower()
        if any(kw in tags_lower for kw in keywords):
            # Keep columns as a list for accurate table rendering
            event_columns = [cell.get_text(separator=' ', strip=True) for cell in cells]
            matches.append(event_columns)
    return matches

def send_email(matches, dry_run=False):
    if not EMAIL_USER or not isinstance(EMAIL_USER, str):
        raise ValueError("EMAIL_USER environment variable is not set or is not a string.")
    week_of = datetime.today().strftime("%Y-%m-%d")
    subject = f"New hardstyle/hardcore/hard dance events found on 19hz.info! (week of {week_of})"

    # Table headers for the email (adjust as needed)
    table_headers = [
        "Date/Time", "Event Title @ Venue", "Tags", "Price | Age", "Organizers", "Links", "Date (sortable)"
    ]

    # Create HTML table rows
    html_rows = ""
    for columns in matches:
        # Pad columns to 7 if any are missing
        columns = columns + [""] * (7 - len(columns))
        html_row = "<tr>" + "".join(f"<td>{col}</td>" for col in columns[:7]) + "</tr>"
        html_rows += html_row

    html_body = f"""
    <html>
      <body>
        <h2>New hardstyle/hardcore/hard dance events found on <a href=\"{EVENT_URL}\">19hz.info</a>! (week of {week_of})</h2>
        <table border=\"1\" cellpadding=\"8\" cellspacing=\"0\">
          <thead>
            <tr>
              {''.join(f'<th>{header}</th>' for header in table_headers)}
            </tr>
          </thead>
          <tbody>
            {html_rows}
          </tbody>
        </table>
      </body>
    </html>
    """
    # Plain text body
    body = "\n\n".join(" | ".join(col for col in columns[:7]) for columns in matches)
    if dry_run:
        print("DRY RUN: Would send the following email:")
        print(f"From: {EMAIL_USER}")
        print(f"To: {EMAIL_TO}")
        print(f"Subject: {subject}")
        print("Text Body:")
        print(body)
        print("HTML Body:")
        print(html_body)
        print("\nMatches:")
        for columns in matches:
            print(" | ".join(col for col in columns[:7]))
        return
    try:
        response = resend.Emails.send({
            "from": EMAIL_USER,
            "to": [EMAIL_TO],
            "subject": subject,
            "text": body,
            "html": html_body,
        })
        print(f"Email sent! Response: {response}")
    except Exception as e:
        print(f"Error sending email: {e}")
