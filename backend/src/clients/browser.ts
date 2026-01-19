import { chromium, Browser } from 'playwright';

let browser: Browser | null = null;

export async function initBrowser(): Promise<void> {
  if (browser) return;

  console.log('🌐 Launching browser...');
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  });
  console.log('✅ Browser ready');
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    console.log('🔒 Browser closed');
  }
}

export async function fetchWithBrowser(url: string): Promise<any> {
  if (!browser) {
    throw new Error('Browser not initialized. Call initBrowser() first.');
  }

  const page = await browser.newPage();

  try {
    // Set realistic viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Set realistic user agent
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: 'https://www.discogs.com/',
      DNT: '1',
      'Sec-Ch-Ua':
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
    });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      (window as any).chrome = {
        runtime: {},
      };

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({
              state: Notification.permission,
            } as PermissionStatus)
          : originalQuery(parameters);
    });

    // Add small random delay before navigation (looks more human)
    await page.waitForTimeout(Math.random() * 200 + 100);

    // Navigate to the URL
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    if (!response) {
      throw new Error('No response from page');
    }

    // Wait a bit for any redirects/JS to execute
    await page.waitForTimeout(500);

    // Check if we got a Cloudflare challenge
    let content = await page.content();
    if (
      content.includes('Just a moment') ||
      content.includes('challenge-platform')
    ) {
      console.log('⏳ Waiting for Cloudflare challenge...');

      // Wait for the body to actually contain JSON (indicated by curly brace)
      try {
        await page.waitForFunction(
          () => {
            const body = document.body.textContent || '';
            return body.trim().startsWith('{') || body.trim().startsWith('[');
          },
          { timeout: 5000 }
        );
        console.log('✅ Challenge resolved');
      } catch (e) {
        console.log('⚠️  Challenge timeout after 5s');
        throw new Error('Cloudflare challenge not resolved');
      }
    }

    // Extract JSON from the page
    const bodyText = await page.evaluate(() => document.body.textContent);

    if (!bodyText) {
      throw new Error('Empty response');
    }

    const trimmed = bodyText.trim();

    // Final check - make sure it's actually JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      if (
        trimmed.includes('Just a moment') ||
        trimmed.includes('challenge-platform')
      ) {
        throw new Error('Cloudflare challenge not resolved');
      }
      throw new Error('Response is not JSON');
    }

    return JSON.parse(trimmed);
  } finally {
    await page.close();
  }
}
