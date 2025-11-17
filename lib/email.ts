import { Event } from './types';
import { generateUnsubscribeUrls } from './crypto';

/**
 * Generate HTML email body for event notifications
 * @param events - Array of events to include
 * @param locationName - Name of the location
 * @param categoryName - Name of the category
 * @param subscriptionId - Subscription ID for unsubscribe link
 * @returns HTML string for email body
 */
export function generateEventEmailHtml(
  events: Event[],
  locationName: string,
  categoryName: string,
  subscriptionId: string
): string {
  const domain = process.env.DOMAIN || 'hardstyleevents.com';
  const { pageUrl } = generateUnsubscribeUrls(subscriptionId, domain);
  const today = new Date().toISOString().split('T')[0];

  let eventRows = '';
  
  if (events.length === 0) {
    eventRows = `
      <tr>
        <td colspan="7" style="padding: 20px; text-align: center; color: #666;">
          No ${categoryName} events found in ${locationName} for the upcoming week.
        </td>
      </tr>
    `;
  } else {
    eventRows = events.map(event => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.dateTime}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.title}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.tags}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.priceAge}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.organizers}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.links}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${event.dateSortable}</td>
      </tr>
    `).join('');
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly ${categoryName} Events - ${locationName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #b71c1c 0%, #e53935 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
    <h1 style="margin: 0 0 10px 0; font-size: 28px;">Weekly ${categoryName} Events</h1>
    <p style="margin: 0; opacity: 0.95; font-size: 16px;">${locationName} - Week of ${today}</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    ${events.length > 0 ? `
      <p style="font-size: 16px; margin-bottom: 20px;">
        Found <strong>${events.length}</strong> ${categoryName} event${events.length === 1 ? '' : 's'} happening in the next week!
      </p>
    ` : `
      <p style="font-size: 16px; margin-bottom: 20px;">
        No ${categoryName} events found for this week. Check back next week!
      </p>
    `}
    
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <thead>
        <tr style="background: #e53935; color: white;">
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Date/Time</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Event @ Venue</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Tags</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Price | Age</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Organizers</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Links</th>
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; border: 1px solid #b71c1c;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${eventRows}
      </tbody>
    </table>
    
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 14px; color: #666;">
      <p style="margin: 5px 0;">
        <strong>HardstyleEvents</strong> - Your weekly ${categoryName} event digest for ${locationName}
      </p>
      <p style="margin: 5px 0;">
        Event data sourced from <a href="https://19hz.info/" style="color: #b71c1c; text-decoration: none;">19hz.info</a>
      </p>
      <p style="margin: 15px 0 5px 0;">
        <a href="${pageUrl}" style="color: #b71c1c; text-decoration: underline; font-size: 12px;">Unsubscribe from these emails</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email body for event notifications
 * @param events - Array of events to include
 * @param locationName - Name of the location
 * @param categoryName - Name of the category
 * @param subscriptionId - Subscription ID for unsubscribe link
 * @returns Plain text string for email body
 */
export function generateEventEmailText(
  events: Event[],
  locationName: string,
  categoryName: string,
  subscriptionId: string
): string {
  const domain = process.env.DOMAIN || 'hardstyleevents.com';
  const { pageUrl } = generateUnsubscribeUrls(subscriptionId, domain);
  const today = new Date().toISOString().split('T')[0];

  let eventText = '';
  
  if (events.length === 0) {
    eventText = `No ${categoryName} events found in ${locationName} for the upcoming week.`;
  } else {
    eventText = events.map(event => {
      return `${event.dateTime} | ${event.title} | ${event.tags} | ${event.priceAge} | ${event.organizers} | ${event.links} | ${event.dateSortable}`;
    }).join('\n\n');
  }

  return `
Weekly ${categoryName} Events - ${locationName}
Week of ${today}

${events.length > 0 ? `Found ${events.length} ${categoryName} event${events.length === 1 ? '' : 's'} happening in the next week!` : 'No events found for this week. Check back next week!'}

${eventText}

---
HardstyleEvents - Your weekly ${categoryName} event digest for ${locationName}
Event data sourced from https://19hz.info/

Unsubscribe: ${pageUrl}
  `.trim();
}

/**
 * Generate email subject line
 * @param eventCount - Number of events
 * @param locationName - Name of the location
 * @param categoryName - Name of the category
 * @returns Subject line string
 */
export function generateEmailSubject(
  eventCount: number,
  locationName: string,
  categoryName: string
): string {
  const today = new Date().toISOString().split('T')[0];
  
  if (eventCount === 0) {
    return `No ${categoryName} events this week in ${locationName} (${today})`;
  }
  
  return `${eventCount} ${categoryName} event${eventCount === 1 ? '' : 's'} this week in ${locationName}! (${today})`;
}

