import { NextResponse } from "next/server";
import { setupPuppeteer } from "@/utils/puppeteer";
import { PrismaClient } from "@prisma/client";
import type { Page, Browser } from "puppeteer";

const prisma = new PrismaClient();

interface CourseData {
  query: string; // Adding query field
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

const BROWSER_CONFIG = {
  headless: "new" as const,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
  ],
} as const;

async function setupPage(page: Page): Promise<void> {
  await Promise.all([
    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      DNT: "1",
      Connection: "keep-alive",
    }),
    page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    }),
  ]);
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  let browser: Browser | undefined;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check if the query already exists in the database
    const existingCourses = await prisma.udemycourse.findMany({ where: { query } });
    if (existingCourses.length > 0) {
      return NextResponse.json({
        courses: existingCourses,
        timestamp: new Date().toISOString(),
        query,
      });
    }

    const puppeteer = setupPuppeteer();
    // @ts-expect-error: Ignoring type error due to dynamic import issue
    browser = await puppeteer.launch(BROWSER_CONFIG);
    const page = await browser.newPage();

    await setupPage(page);

    const searchUrl = `https://www.udemy.com/courses/search/?price=price-free&q=${encodeURIComponent(
      query
    )}+free&ratings=4.5&sort=relevance&src=ukw`;

    const response = await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    if (!response?.ok()) {
      throw new Error(`Failed to load page: ${response?.status()}`);
    }

    await page.waitForSelector(SELECTORS.courseCard, {
      timeout: 15000,
    });

    const courses: CourseData[] = await page.evaluate((selectors, query) => {
      return Array.from(
        document.querySelectorAll<HTMLElement>(selectors.courseCard)
      )
        .slice(0, 10)
        .map((card) => {
          const linkElement = card.querySelector("a") as HTMLElement | null;
          const fullText = linkElement?.textContent?.trim() || '';      
          const name = fullText.split('<')[0].trim();
          const link = linkElement?.getAttribute("href");
          const description =
            card.querySelector(selectors.description)?.textContent?.trim() || "";
          const rating = parseFloat(
            card.querySelector(selectors.rating)?.textContent?.trim() || "0"
          );
          const thumbnail =
            card.querySelector(selectors.image)?.getAttribute("src") || "";

          return {
            query, // Pass the query here to save it in the database
            name,
            description,
            rating,
            thumbnail,
            registrationLink: link ? `https://www.udemy.com${link}` : null,
          };
        })
        .filter((course) => course.name && course.rating >= 4.5);
    }, SELECTORS, query); // Pass query to the evaluate function

    // Save courses to database
    const savedCourses = await Promise.all(
      courses.map(async (course) => {
        return prisma.udemycourse.upsert({
          where: { registrationLink: course.registrationLink || "" },
          update: {
            name: course.name,
            description: course.description,
            rating: course.rating,
            thumbnail: course.thumbnail,
            query: course.query, // Save query in the database
          },
          create: {
            name: course.name,
            description: course.description,
            rating: course.rating,
            thumbnail: course.thumbnail,
            registrationLink: course.registrationLink || "",
            query: course.query, // Save query in the database
          },
        });
      })
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
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch((error: Error) =>
        console.error("Error closing browser:", error)
      );
    }
  }
}
