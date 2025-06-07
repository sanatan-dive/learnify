import { NextResponse } from "next/server";
import { setupPuppeteer } from "@/utils/puppeteer";
import { PrismaClient } from "@prisma/client";
import type { Page, Browser } from "puppeteer-core";

const prisma = new PrismaClient();

interface CourseData {
  query: string;
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

const SELECTORS = {
  courseCard: ".course-card-module--container--3oS-F",
  title: ".course-card-title-module--title--W49Ap",
  description: ".course-card-module--course-headline--v-7gj",
  rating: ".star-rating-module--rating-number--2-qA2",
  image: ".course-card-image-module--image--dfkFe",
} as const;

const CACHE_EXPIRATION_HOURS = 24;

async function getCachedCourses(query: string): Promise<CourseData[] | null> {
  const courses = await prisma.udemycourse.findMany({ 
    where: { 
      query,
      createdAt: { gte: new Date(Date.now() - CACHE_EXPIRATION_HOURS * 60 * 60 * 1000) }
    } 
  });
  return courses.length > 0 ? courses : null;
}

async function verifyBrowserStatus(browser: Browser): Promise<boolean> {
  try {
    if (!browser.isConnected()) {
      console.error("❌ Browser is not connected");
      return false;
    }

    const version = await browser.version();
    console.log("✅ Browser is active:", version);
    
    return true;
  } catch (error) {
    console.error("❌ Browser verification failed:", error);
    return false;
  }
}

async function verifyPageLoad(page: Page, expectedUrl: string): Promise<boolean> {
  try {
    const currentUrl = page.url();
    console.log("📍 Current URL:", currentUrl);
    
    if (!currentUrl || currentUrl === 'about:blank') {
      console.error("❌ Page not loaded - URL is blank");
      return false;
    }

    const expectedDomain = new URL(expectedUrl).origin;
    const currentDomain = new URL(currentUrl).origin;
    
    if (currentDomain !== expectedDomain) {
      console.error(`❌ URL mismatch - Expected: ${expectedDomain}, Got: ${currentDomain}`);
      return false;
    }

    const title = await page.title();
    console.log("📄 Page title:", title);
    
    if (!title || title.toLowerCase().includes('error') || title.toLowerCase().includes('not found')) {
      console.error("❌ Page appears to have error or not found");
      return false;
    }

    const hasBody = await page.evaluate(() => {
      return document.body && document.body.children.length > 0;
    });

    if (!hasBody) {
      console.error("❌ Page body not loaded or empty");
      return false;
    }

    console.log("✅ Page loaded successfully");
    return true;
  } catch (error) {
    console.error("❌ Page verification failed:", error);
    return false;
  }
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Environment detection
    const isProduction = process.env.NODE_ENV === 'production';
    const isRender = process.env.RENDER === 'true';
    console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}, Render: ${isRender}`);

    // Check cached results first
    const cachedCourses = await getCachedCourses(query);
    if (cachedCourses) {
      return NextResponse.json({
        courses: cachedCourses,
        timestamp: new Date().toISOString(),
        query,
      });
    }

    console.log("🚀 Launching browser...");
    const puppeteer = setupPuppeteer();
    
    // Enhanced browser launch with cloud-specific settings
    // @ts-ignore
    browser = await puppeteer.launch({
      headless: true,
      args: isProduction || isRender ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ] : [
        '--no-sandbox',
        '--disable-gpu'
      ]
    });

    // Verify browser is properly opened
    // @ts-ignore
    const isBrowserReady = await verifyBrowserStatus(browser);
    if (!isBrowserReady) {
      throw new Error("Browser failed to launch properly");
    }

    // console.log("📝 Creating new page...");
    // @ts-ignore
    page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // Additional settings for cloud environments
    if (isProduction || isRender) {
      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);
    }

    const searchUrl = `https://www.udemy.com/courses/search/?price=price-free&q=${encodeURIComponent(query)}+free&ratings=4.5&sort=relevance&src=ukw`;
    // console.log("🌐 Navigating to:", searchUrl);

    // Navigate with enhanced timeout for cloud environments
    const response = await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: isProduction || isRender ? 30000 : 15000
    });

    if (!response) {
      throw new Error("Failed to navigate to URL - no response received");
    }

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    // console.log("✅ Navigation successful, status:", response.status());

    // Verify page loaded correctly
    const isPageReady = await verifyPageLoad(page, searchUrl);
    if (!isPageReady) {
      throw new Error("Page failed to load properly");
    }

    // Wait for course cards with extended timeout for cloud
    // console.log("⏳ Waiting for course cards...");
    try {
      await page.waitForSelector(SELECTORS.courseCard, { 
        timeout: isProduction || isRender ? 30000 : 20000 
      });
      console.log("✅ Course cards found");
    } catch (error) {
      await page.waitForTimeout(5000);
      const courseCount = await page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, SELECTORS.courseCard);
      
      if (courseCount === 0) {
        throw new Error("No course cards found on the page");
      }
      // console.log(`✅ Found ${courseCount} course cards after additional wait`);
    }

    // Extract course data
    // console.log("📊 Extracting course data...");
    const courses: CourseData[] = await page.evaluate((selectors, query) => {
      return Array.from(
        document.querySelectorAll<HTMLElement>(selectors.courseCard)
      )
        .slice(0, 5)
        .map((card) => {
          const linkElement = card.querySelector("a") as HTMLElement | null;
          const name = linkElement?.textContent?.trim().split('<')[0] || '';
          const link = linkElement?.getAttribute("href");
          const description = card.querySelector(selectors.description)?.textContent?.trim() || "";
          const rating = parseFloat(card.querySelector(selectors.rating)?.textContent?.trim() || "0");
          const thumbnail = card.querySelector(selectors.image)?.getAttribute("src") || "";

          return {
            query,
            name,
            description,
            rating,
            thumbnail,
            registrationLink: link ? `https://www.udemy.com${link}` : null,
          };
        })
        .filter((course) => course.name && course.rating >= 4.5);
    }, SELECTORS, query);

    // console.log(`📚 Extracted ${courses.length} courses`);

    if (courses.length === 0) {
      console.warn("⚠️ No courses found matching criteria");
      return NextResponse.json({
        courses: [],
        timestamp: new Date().toISOString(),
        query,
      });
    }

    // Save to database
    // console.log("💾 Saving to database...");
    const savedCourses = await Promise.all(
      courses.map(course => 
        prisma.udemycourse.upsert({
          where: { registrationLink: course.registrationLink || "" },
          update: { 
            query: course.query,
            name: course.name,
            description: course.description,
            rating: course.rating,
            thumbnail: course.thumbnail,
            registrationLink: course.registrationLink || "",
            createdAt: { set: new Date() }
          },
          create: {
            ...course,
            registrationLink: course.registrationLink || "",
            createdAt: new Date()
          }
        })
      )
    );

    console.log("✅ Scraping completed successfully");
    return NextResponse.json({
      courses: savedCourses,
      timestamp: new Date().toISOString(),
      query,
    });

  } catch (error: any) {
    console.error("❌ Scraping error:", error?.message || error);
    
    // Log additional debug info for cloud environments
    if (process.env.NODE_ENV === 'production') {
      console.error("🔍 Environment debug:", {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        nodeEnv: process.env.NODE_ENV,
        render: process.env.RENDER
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  } finally {
    if (page) {
      // console.log("🧹 Closing page...");
      await page.close().catch(console.error);
    }
    if (browser) {
      // console.log("🧹 Closing browser...");
      await browser.close().catch(console.error);
    }
  }
}