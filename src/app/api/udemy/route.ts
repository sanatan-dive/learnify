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
      args: ["--no-sandbox", "--disable-gpu"]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const searchUrl = `https://www.udemy.com/courses/search/?price=price-free&q=${encodeURIComponent(query)}+free&ratings=4.5&sort=relevance&src=ukw`;

    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });

    await page.waitForSelector(SELECTORS.courseCard, { timeout: 10000 });

    const courses: CourseData[] = await page.evaluate((selectors, query) => {
      return Array.from(
        document.querySelectorAll<HTMLElement>(selectors.courseCard)
      )
        .slice(0, 5)  // Reduced from 10 to 5
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
            createdAt: { set: new Date() } // Use set for Date fields
          },
          create: {
            ...course,
            registrationLink: course.registrationLink || "",
            createdAt: new Date() // Directly set Date during creation
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