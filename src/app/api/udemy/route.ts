import { NextResponse } from "next/server";
import { setupPuppeteer } from '@/utils/puppeteer';
import type { Page, Browser } from 'puppeteer';

// Types for better type safety
interface CourseData {
  name: string;
  description: string;
  rating: number;
  thumbnail: string;
  registrationLink: string | null;
}

interface ApiResponse {
  courses: CourseData[];
  timestamp: string;
  query: string;
}

interface ApiError {
  error: string;
  details?: string;
}

// Constants
const SELECTORS = {
  courseCard: ".course-card-module--container--3oS-F",
  title: ".course-card-title-module--course-title--wmFXN",
  description: ".course-card-module--course-headline--v-7gj",
  rating: ".star-rating-module--rating-number--2-qA2",
  image: ".course-card-image-module--image--dfkFe"
} as const;

const BROWSER_CONFIG = {
  headless: "new" as const, // Use new headless mode for better performance
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ]
} as const;

// Helper function to setup page
async function setupPage(page: Page): Promise<void> {
  await Promise.all([
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
    page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'DNT': '1',
      'Connection': 'keep-alive'
    }),
    page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    })
  ]);
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  let browser: Browser | undefined;
  
  try {
    // Input validation
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Initialize puppeteer with our utility
    const puppeteer = setupPuppeteer();
    //@ts-ignore
    browser = await puppeteer.launch(BROWSER_CONFIG);
    const page = await browser.newPage();
    
    // Configure browser environment
    await setupPage(page);

    // Construct search URL with encoding
    const searchUrl = `https://www.udemy.com/courses/search/?price=price-free&q=${encodeURIComponent(query)}+free&ratings=4.5&sort=relevance&src=ukw`;
    
    // Navigate with proper error handling
    const response = await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!response?.ok()) {
      throw new Error(`Failed to load page: ${response?.status()}`);
    }

    // Wait for content with timeout
    await page.waitForSelector(SELECTORS.courseCard, {
      timeout: 15000
    });

    // Extract course data
    const courses: CourseData[] = await page.evaluate((selectors) => {
      return Array.from(document.querySelectorAll<HTMLElement>(selectors.courseCard))
        .slice(0, 20) // Limit to first 20 results for performance
        .map(card => {
          const link = card.querySelector('a')?.getAttribute('href');
          
          return {
            name: card.querySelector(selectors.title)?.textContent?.trim() || '',
            description: card.querySelector(selectors.description)?.textContent?.trim() || '',
            rating: parseFloat(card.querySelector(selectors.rating)?.textContent?.trim() || '0'),
            thumbnail: card.querySelector(selectors.image)?.getAttribute('src') || '',
            registrationLink: link ? `https://www.udemy.com${link}` : null
          };
        })
        .filter(course => course.name && course.rating >= 4.5); // Filter invalid entries
    }, SELECTORS);

    return NextResponse.json({
      courses,
      timestamp: new Date().toISOString(),
      query
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch courses',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );

  } finally {
    // Ensure browser cleanup
    if (browser) {
      await browser.close().catch((error: Error) => 
        console.error('Error closing browser:', error)
      );
    }
  }
}