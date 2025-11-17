# HardstyleEvents

A multi-location email subscription service for genre-based event notifications.

## Features

- 🎵 Weekly email digests for hardstyle/hardcore events
- 📍 Multi-location support (18+ cities across North America)
- 🔒 Secure unsubscribe with HMAC-SHA256 tokens
- 📧 Batch email sending via Resend
- 🎨 Modern, responsive UI with Next.js and Tailwind CSS
- 🗄️ PostgreSQL database via Supabase

## Tech Stack

## Getting Started

### Prerequisites


- Node.js 18+ and npm
- Supabase account
- Resend account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event_watcher
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
RESEND_API_KEY=your_resend_api_key
HMAC_SECRET=your_random_secret_key
DOMAIN=hardstyleevents.com
EMAIL_USER=notifications@hardstyleevents.com
```

4. Initialize the database:
Run the SQL script in `supabase-schema.sql` in your Supabase SQL editor.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Database Schema

The application uses four main tables:

- **users:** Email addresses and user metadata
- **categories:** Event categories (currently "hardstyle")
- **locations:** Geographic locations with event URLs
- **subscriptions:** User subscriptions with many-to-many relationships

See `supabase-schema.sql` for the complete schema.

## API Endpoints

### POST /api/subscribe
Subscribe a user to event notifications for a specific location.

**Body:**
```json
{
  "email": "user@example.com",
  "location": "San Francisco Bay Area / Northern California"
}
```

### POST /api/unsubscribe/:token.:sig
Unsubscribe endpoint with HMAC signature verification.

### GET /unsubscribe?token=...&sig=...
Human-facing unsubscribe confirmation page.

### POST /api/cron/send-weekly
Weekly cron job that sends batch emails. Protected by Vercel Cron Secret.

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

The cron job will automatically run every Monday at 8:00 AM (configured in `vercel.json`).

### Environment Variables in Vercel

Add these as Vercel environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`
- `HMAC_SECRET`
- `DOMAIN`
- `EMAIL_USER`

## Project Structure

```
/app
  /page.tsx                      - Landing page
  /unsubscribe/page.tsx          - Unsubscribe page
  /api
    /subscribe/route.ts          - Subscription endpoint
    /unsubscribe/[slug]/route.ts - Unsubscribe API
    /cron/send-weekly/route.ts   - Weekly email cron
/lib
  /crypto.ts                     - HMAC utilities
  /supabase.ts                   - Supabase client
  /types.ts                      - TypeScript types
  /locations.ts                  - Location mappings
  /email.ts                      - Email templates
  /scraper.ts                    - Event scraping
```

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT

## Acknowledgments

- Event data sourced from 19hz.info
- Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and [Resend](https://resend.com)
