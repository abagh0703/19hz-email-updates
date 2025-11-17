import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseClient } from '@/lib/supabase';
import { scrapeEvents } from '@/lib/scraper';
import { generateEventEmailHtml, generateEventEmailText, generateEmailSubject } from '@/lib/email';
import { generateUnsubscribeUrls } from '@/lib/crypto';
import { SubscriptionWithDetails } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN = process.env.DOMAIN || 'hardstyleevents.com';
const BATCH_SIZE = 100; // Resend's batch limit

// Used for vercel cron to trigger the job
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.CRON_SECRET) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const results = {
      totalSubscriptions: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Get all active subscriptions with full details
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        is_active,
        user_id,
        category_id,
        location_id,
        users!inner(id, email),
        categories!inner(id, name),
        locations!inner(id, name, event_url)
      `)
      .eq('is_active', true);

    if (subscriptionsError || !subscriptions) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    results.totalSubscriptions = subscriptions.length;

    // Type assertion for subscriptions with joined data
    type SubscriptionWithJoins = {
      id: string;
      users: { id: string; email: string };
      categories: { id: string; name: string };
      locations: { id: string; name: string; event_url: string };
    };

    const typedSubscriptions = subscriptions as unknown as SubscriptionWithJoins[];

    // Group subscriptions by location and category
    const groupedSubscriptions = new Map<string, SubscriptionWithJoins[]>();
    
    for (const subscription of typedSubscriptions) {
      const key = `${subscription.locations.id}-${subscription.categories.id}`;
      if (!groupedSubscriptions.has(key)) {
        groupedSubscriptions.set(key, []);
      }
      groupedSubscriptions.get(key)!.push(subscription);
    }

    // Process each location/category group
    for (const [key, subs] of groupedSubscriptions.entries()) {
      if (subs.length === 0) continue;

      const location = subs[0].locations;
      const category = subs[0].categories;

      console.log(`Processing ${subs.length} subscriptions for ${location.name} - ${category.name}`);

      try {
        // Scrape events for this location
        const events = await scrapeEvents(location.event_url);
        console.log(`Found ${events.length} events for ${location.name}`);

        // Prepare batch emails (up to 100 at a time)
        const emailBatches: any[][] = [];
        let currentBatch: any[] = [];

        for (const sub of subs) {
          const email = sub.users.email;
          const subscriptionId = sub.id;

          const { apiUrl } = generateUnsubscribeUrls(subscriptionId, DOMAIN);
          
          const emailData = {
            from: `HardstyleEvents <${process.env.EMAIL_USER || 'notifications@hardstyleevents.com'}>`,
            to: email,
            subject: generateEmailSubject(events.length, location.name, category.name),
            html: generateEventEmailHtml(events, location.name, category.name, subscriptionId),
            text: generateEventEmailText(events, location.name, category.name, subscriptionId),
            reply_to: 'abagh0703+hardstyleevents@gmail.com',
            headers: {
              'List-Unsubscribe': `<${apiUrl}>, <mailto:unsubscribe@${DOMAIN}?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          };

          currentBatch.push(emailData);

          if (currentBatch.length >= BATCH_SIZE) {
            emailBatches.push(currentBatch);
            currentBatch = [];
          }
        }

        // Add remaining emails
        if (currentBatch.length > 0) {
          emailBatches.push(currentBatch);
        }

        // Send all batches
        for (const batch of emailBatches) {
          try {
            const response = await resend.batch.send(batch);
            
            if (response.error) {
              console.error('Batch send error:', response.error);
              results.errors.push(`Batch send failed for ${location.name}: ${response.error.message}`);
            } else {
              results.emailsSent += batch.length;
              console.log(`Successfully sent ${batch.length} emails for ${location.name}`);
            }
          } catch (batchError) {
            console.error('Error sending batch:', batchError);
            results.errors.push(`Batch send exception for ${location.name}: ${batchError}`);
          }
        }

      } catch (scrapeError) {
        console.error(`Error processing ${location.name}:`, scrapeError);
        results.errors.push(`Failed to process ${location.name}: ${scrapeError}`);
      }
    }

    console.log('Cron job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Weekly emails sent',
      results,
    });

  } catch (error) {
    console.error('Error in cron endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


