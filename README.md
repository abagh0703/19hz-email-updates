# Event Watcher

This script monitors the [19hz.info Bay Area event listing](https://19hz.info/eventlisting_BayArea.php) for upcoming hardstyle, hardcore, and hard dance events, and sends an email notification if any are found within the next week.

## Features
- Scrapes the event listing page for new events.
- Filters events by keywords ("hardstyle", "hardcore").
- Only includes events happening within the next 7 days.
- Sends a formatted email with event details using the [Resend](https://resend.dev/) email API.
- Supports a `--dry-run` mode to preview the email without sending.

## Requirements
- Python 3.7+
- The following Python packages:
  - `requests`
  - `beautifulsoup4`
  - `python-dotenv`
  - `resend`

Install dependencies with:
```bash
pip install -r requirements.txt
```

## Setup
1. **Clone this repository** and navigate to the project directory.
2. **Create a `.env` file** in the project root with the following variables:
    ```env
    EMAIL_USER=onboarding@resend.dev
    EMAIL_TO=recipient@example.com
    RESEND_API_KEY=your_resend_api_key
    ```
   - `EMAIL_USER` must be a sender email verified with Resend.
   - `EMAIL_TO` is the recipient's email address.
   - `RESEND_API_KEY` is your Resend API key.

3. **(Optional) Edit keywords**
   - By default, the script looks for "hardstyle" and "hardcore" events. You can change the `keywords` list in `watch_events.py` if needed.

## Usage

### Dry Run (Preview Email)
To see what would be sent, without actually sending an email:
```bash
python3 watch_events.py --dry-run
```

### Send Email
To run the script and send an email if matching events are found:
```bash
python3 watch_events.py
```

## Scheduling
To run this script automatically (e.g., daily), set up a cron job or use another scheduler.

## License
MIT 