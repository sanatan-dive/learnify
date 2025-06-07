// pages/api/debug-browser.ts or app/api/debug-browser/route.ts
import { NextResponse } from "next/server";
import { setupPuppeteer } from "@/utils/puppeteer";
import { execSync } from 'child_process';
import fs from 'fs';

export async function GET() {
  try {
    // System information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV,
      render: process.env.RENDER,
      puppeteerPath: process.env.PUPPETEER_EXECUTABLE_PATH,
      chromiumPath: process.env.CHROME_BIN || process.env.CHROMIUM_PATH
    };

    // Check if Chromium executable exists
    const chromiumPaths = [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable'
    ];

    const availablePaths = chromiumPaths.filter(path => {
      try {
        return fs.existsSync(path);
      } catch {
        return false;
      }
    });

    // Try to get Chromium version
    let chromiumVersion = null;
    try {
      if (availablePaths.length > 0) {
        chromiumVersion = execSync(`${availablePaths[0]} --version`, { encoding: 'utf8' }).trim();
      }
    } catch (error) {
      chromiumVersion = `Error getting version: ${error}`;
    }

    // Test browser launch
    let browserTest = null;
    try {
      console.log('🧪 Testing browser launch...');
      const puppeteer = setupPuppeteer();
      const browser = await puppeteer.launch({
        headless: true,
        timeout: 10000
      });
      
      const version = await browser.version();
      const pages = await browser.pages();
      await browser.close();
      
      browserTest = {
        success: true,
        version,
        initialPages: pages.length
      };
    } catch (error : any) {
      browserTest = {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }

    return NextResponse.json({
      systemInfo,
      availableChromiumPaths: availablePaths,
      chromiumVersion,
      browserTest,
      timestamp: new Date().toISOString()
    });

  } catch (error:any) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}