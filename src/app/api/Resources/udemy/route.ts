import { NextResponse } from "next/server";
import { setupPuppeteer } from "@/utils/puppeteer";
import { PrismaClient } from "@prisma/client";
import type { Page, Browser } from "puppeteer";

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

// Updated selectors based on the actual HTML structure
const SELECTORS = {
  // Try multiple possible selectors for course cards
  courseCard: [
    ".vertical-card-module--primary-top---MLV-",
    ".course-card-module--container--3oS-F",
    "[data-purpose='course-card-container']",
    ".course-card",
    ".card-container"
  ],
  title: [
    ".card-title-module--title--bv1rZ a",
    ".card-title-module--clipped--DPJnT",
    ".course-card-title-module--title--W49Ap",
    ".ud-heading-lg a"
  ],
  description: [
    "[data-purpose='safely-set-inner-html:course-card:course-headline']",
    ".card-description-module--description--5tzNB span",
    ".course-card-module--course-headline--v-7gj"
  ],
  rating: [
    ".star-rating-module--rating-number--2-qA2",
    "[data-purpose='rating-number']"
  ],
  image: [
    ".card-media-image-module--image---SB4-",
    ".course-card-image-module--image--dfkFe",
    "img[alt='']"
  ],
  link: [
    ".card-title-module--title--bv1rZ a",
    ".ud-heading-lg a",
    "h3 a"
  ]
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

// Helper function to find element using multiple selectors
function findElementBySelectors(container: Element, selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) return element;
  }
  return null;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  let browser: Browser | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check cached results first
    const cachedCourses = await getCachedCourses(query);
    if (cachedCourses) {
      return NextResponse.json({
        courses: cachedCourses,
        timestamp: new Date().toISOString(),
        query,
      });
    }

    const puppeteer = setupPuppeteer();
    browser = await puppeteer.launch({ 
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const searchUrl = `https://www.udemy.com/courses/search/?price=price-free&q=${encodeURIComponent(query)}&ratings=4.5&sort=relevance&src=ukw`;

    console.log('Navigating to:', searchUrl);
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to find course cards using multiple selectors
    let foundSelector = null;
    for (const selector of SELECTORS.courseCard) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const elements = await page.$(selector);
        if (elements && elements.length > 0) {
          console.log(`Found ${elements.length} courses using selector: ${selector}`);
          foundSelector = selector;
          break;
        }
      } catch (error) {
        console.log(`Selector ${selector} not found, trying next...`);
        continue;
      }
    }

    if (!foundSelector) {
      // Debug: Check what's actually on the page
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      console.log('Page has course-related content:', pageContent.includes('course'));
      
      throw new Error('No course cards found with any selector');
    }

    const courses: CourseData[] = await page.evaluate((selectors, query) => {
      const findElementBySelectors = (container: Element, selectorArray: string[]): Element | null => {
        for (const selector of selectorArray) {
          const element = container.querySelector(selector);
          if (element) return element;
        }
        return null;
      };

      // Try each course card selector until we find elements
      let courseCards: NodeListOf<Element> | null = null;
      for (const selector of selectors.courseCard) {
        courseCards = document.querySelectorAll(selector);
        if (courseCards.length > 0) break;
      }

      if (!courseCards || courseCards.length === 0) {
        return [];
      }

      return Array.from(courseCards)
        .slice(0, 5)
        .map((card) => {
          try {
            // Get course link and name
            const linkElement = findElementBySelectors(card, selectors.link) as HTMLAnchorElement;
            const name = linkElement?.textContent?.trim().replace(/<[^>]*>/g, '') || '';
            const link = linkElement?.getAttribute("href");
            
            // Get description
            const descElement = findElementBySelectors(card, selectors.description);
            const description = descElement?.textContent?.trim() || "";
            
            // Get rating
            const ratingElement = findElementBySelectors(card, selectors.rating);
            const ratingText = ratingElement?.textContent?.trim() || "0";
            const rating = parseFloat(ratingText);
            
            // Get thumbnail
            const imgElement = findElementBySelectors(card, selectors.image) as HTMLImageElement;
            const thumbnail = imgElement?.src || imgElement?.getAttribute("src") || "";

            return {
              query,
              name,
              description,
              rating: isNaN(rating) ? 0 : rating,
              thumbnail,
              registrationLink: link ? (link.startsWith('http') ? link : `https://www.udemy.com${link}`) : null,
            };
          } catch (error) {
            console.error('Error processing course card:', error);
            return null;
          }
        })
        .filter((course): course is CourseData => 
          course !== null && 
          course.name && 
          course.rating >= 4.5
        );
    }, SELECTORS, query);

    console.log(`Extracted ${courses.length} courses`);

    if (courses.length === 0) {
      return NextResponse.json({
        courses: [],
        timestamp: new Date().toISOString(),
        query,
      });
    }

    // Parallel database operations
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

    return NextResponse.json({
      courses: savedCourses,
      timestamp: new Date().toISOString(),
      query,
    });

  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}