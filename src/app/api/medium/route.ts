import { NextResponse } from "next/server";
import { setupPuppeteer } from '@/utils/puppeteer';
import type { Page, Browser } from 'puppeteer';

// Types for better type safety
interface BlogData {
  title: string;
  link: string | null;
  author: string | null;
  description: string | null;
}

interface ApiResponse {
  blogs: BlogData[];
  timestamp: string;
  query: string;
}

interface ApiError {
  error: string;
  details?: string;
}

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
    //@ts-expect-error
    browser = await puppeteer.launch(BROWSER_CONFIG);
    const page = await browser.newPage();
    
    // Configure browser environment
    await setupPage(page);

    // Construct search URL with encoding
    const url = `https://medium.com/search?q=${encodeURIComponent(query)}+roadmap`; ;
    
    // Navigate with proper error handling
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (!response?.ok()) {
      throw new Error(`Failed to load page: ${response?.status()}`);
    }

    await page.waitForSelector('.bh.l');

    const blogs = await page.evaluate(() => {
      const blogElements = document.querySelectorAll('.bh.l');
      const blogData: BlogData[] = [];
      
      // Only loop through the first 10 blogs
      for (let i = 0; i < Math.min(10, blogElements.length); i++) {
        const blog = blogElements[i];
        const title = blog.querySelector('h2')?.innerText || null;
        const link = (blog.querySelector('a.af.ag.ah.ai.aj.ak.al.am.an.ao.ap.aq.ar.as.at[href^="/@"]') as HTMLAnchorElement)?.href || null;
        const author = (blog.querySelector('a[rel="noopener follow"] > p') as HTMLTextAreaElement)?.innerText || null;
        const description = blog.querySelector('h3')?.innerText || null;
    
        if (title && link && author && description) {
          blogData.push({ title, link, author, description });
        }
      }
      
      return blogData;
    });
    
  
    await browser.close();
  
    return NextResponse.json({
      blogs,
      timestamp: new Date().toISOString(),
      query
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch blogs',
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
