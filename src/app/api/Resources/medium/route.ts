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

    await page.waitForSelector(
      '.bh.mv.mw.mx.my, article, .js-postListItem',
      { timeout: 45000 }
    );

    const blogs = await page.evaluate(() => {
      const blogElements = document.querySelectorAll(
        '.bh.mv.mw.mx.my, article, .js-postListItem'
      );
      
      if (blogElements.length === 0) {
        return [];
      }

      const blogData: BlogData[] = [];

      for (let i = 0; i < Math.min(10, blogElements.length); i++) {
        const blog = blogElements[i];

        // Title selection
        const titleElement = blog.querySelector('h2.bf.ju, h2, h1');
        const title = titleElement?.textContent?.trim() || null;

        // Link selection
        const linkElement = blog.querySelector(
          'a[href*="?source=search_post"], a[href*="/p/"], a[href*="@"]'
        ) as HTMLAnchorElement;
        const link = linkElement?.href || null;

        // Author selection
        const authorElement = blog.querySelector(
          'p.bf.b.jc.z.cr.cs.ct.cu.cv.cw.cx.cy.bk, ' + // Matches your new author HTML
          'a[href*="/@"][rel="noopener follow"] > p.bf.b.jc.z, ' +
          '.author, a[href*="/@"]'
        );
        const author = authorElement?.textContent?.trim() || null;

        // Description selection
        const descriptionElement = blog.querySelector(
          '.op h3.bf.b.ic.z.cr.jv.ct.cu.jw.cw.cy.cm, ' + // Matches your description HTML
          'h3.bf.b.ic.z, h3, p'
        );
        const description = descriptionElement?.textContent?.trim() || null;

        if (title && link) {
          blogData.push({ 
            title, 
            link, 
            author,
            description 
          });
        }
      }

      return blogData;
    });

    if (blogs.length === 0) {
      throw new Error('No blog posts found with the provided selectors');
    }

    // console.log("Found blogs:", blogs);

    const savedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        const existingBlog = await prisma.blog.findUnique({
          where: { link: blog.link || "" },
        });

        if (existingBlog) {
          return existingBlog;
        }

        return prisma.blog.create({
          data: {
            query,
            title: blog.title,
            link: blog.link || "",
            author: blog.author,
            description: blog.description,
          },
        });
      })
    );

    console.log("Saved blogs:", savedBlogs);

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
        details: process.env.NODE_ENV === "development"
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