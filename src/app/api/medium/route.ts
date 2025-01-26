import { NextResponse } from "next/server";
import { setupPuppeteer } from '@/utils/puppeteer';
import { PrismaClient } from "@prisma/client";
import type { Page, Browser } from 'puppeteer';

const prisma = new PrismaClient();

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
  headless: "new" as const,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ]
} as const;

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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check if blogs with the given query already exist in the database
    const existingBlogs = await prisma.blog.findMany({
      where: { query },
    });

    if (existingBlogs.length > 0) {
      return NextResponse.json({
        blogs: existingBlogs.map((blog) => ({
          title: blog.title,
          link: blog.link,
          author: blog.author,
          description: blog.description,
        })),
        timestamp: new Date().toISOString(),
        query,
      });
    }

    const puppeteer = setupPuppeteer();
    // @ts-expect-error: Ignoring type error due to dynamic import issue
    browser = await puppeteer.launch(BROWSER_CONFIG);
    const page = await browser.newPage();

    await setupPage(page);

    const url = `https://medium.com/search?q=${encodeURIComponent(query)}+roadmap`;

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    if (!response?.ok()) {
      throw new Error(`Failed to load page: ${response?.status()}`);
    }

    await page.waitForSelector(".bh.l");

    const blogs = await page.evaluate(() => {
      const blogElements = document.querySelectorAll(".bh.l");
      const blogData: BlogData[] = [];

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

    // Save blogs to the database
    const savedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        // Check if the blog already exists in the database
        const existingBlog = await prisma.blog.findUnique({
          where: { link: blog.link || "" },
        });

        if (existingBlog) {
          return existingBlog;
        }

        return prisma.blog.create({
          data: {
            query, // Store the query that was used to find the blog
            title: blog.title,
            link: blog.link || "",
            author: blog.author,
            description: blog.description,
          },
        });
      })
    );

    return NextResponse.json({
      blogs: savedBlogs.map((savedBlog) => ({
        title: savedBlog.title,
        link: savedBlog.link,
        author: savedBlog.author,
        description: savedBlog.description,
      })),
      timestamp: new Date().toISOString(),
      query,
    });
  } catch (error) {
    console.error("Scraping error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch blogs",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close().catch((error: Error) =>
        console.error("Error closing browser:", error),
      );
    }
  }
}

