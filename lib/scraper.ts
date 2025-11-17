import { load } from 'cheerio';
import { Event } from './types';

/**
 * Fetch and parse events from 19hz.info
 * @param eventUrl - The URL to scrape events from
 * @param keywords - Keywords to match in event tags (default: hardstyle, hardcore, uptempo, frenchcore)
 * @returns Array of matching events
 */
export async function scrapeEvents(
  eventUrl: string,
  keywords: string[] = ['hardstyle', 'hardcore', 'uptempo', 'frenchcore']
): Promise<Event[]> {
  try {
    const response = await fetch(eventUrl, {
      headers: {
        'User-Agent': 'HardstyleEvents/1.0 (hardstyle event notification service)',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    const $ = load(html);
    const matches: Event[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    $('tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 7) {
        return; // Skip rows without enough columns
      }

      // Extract data from columns
      const dateSortable = $(cells[6]).text().trim(); // Last column (YYYY/MM/DD)
      const tags = $(cells[2]).text().trim(); // Third column (tags)

      // Parse date
      const eventDate = new Date(dateSortable);
      if (isNaN(eventDate.getTime())) {
        return; // Skip if date can't be parsed
      }

      // Check if event is within the next week
      if (eventDate < today || eventDate > oneWeekFromNow) {
        return;
      }

      // Check if any keyword matches in tags (case-insensitive)
      const tagsLower = tags.toLowerCase();
      const hasMatchingKeyword = keywords.some(kw => tagsLower.includes(kw.toLowerCase()));

      if (!hasMatchingKeyword) {
        return;
      }

      // Extract all columns
      const event: Event = {
        dateTime: $(cells[0]).text().trim(),
        title: $(cells[1]).text().trim(),
        tags: tags,
        priceAge: $(cells[3]).text().trim(),
        organizers: $(cells[4]).text().trim(),
        links: (() => {
          const linkCells = $(cells[5]).find('a');
          if (linkCells.length === 0) {
            return $(cells[5]).text().trim();
          }
          const linkHtml = linkCells
            .map((_, a) => {
              const href = $(a).attr('href')?.trim();
              const text = $(a).text().trim() || href || '';
              if (!href) {
                return text;
              }
              return `<a href="${href}">${text}</a>`;
            })
            .get()
            .filter(Boolean)
            .join(' ');
          return linkHtml || $(cells[5]).text().trim();
        })(),
        dateSortable: dateSortable,
      };

      matches.push(event);
    });

    return matches;
  } catch (error) {
    console.error(`Error scraping events from ${eventUrl}:`, error);
    throw new Error(`Failed to scrape events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

