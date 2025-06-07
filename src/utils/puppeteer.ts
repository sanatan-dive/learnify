// utils/puppeteer.ts
import puppeteer from 'puppeteer-core';

export function setupPuppeteer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER === 'true';
  
  if (isProduction || isRender) {
    // Production/Cloud configuration for Render.com
    return {
      launch: (options: any = {}) => {
        return puppeteer.launch({
          executablePath: '/usr/bin/chromium',
          headless: true,
          args: [
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
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-cloud-import',
            '--disable-gesture-typing',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-offer-upload-credit-cards',
            '--disable-print-preview',
            '--disable-voice-input',
            '--disable-wake-on-wifi',
            '--disable-cookie-encryption',
            '--ignore-gpu-blacklist',
            '--enable-async-dns',
            '--enable-simple-cache-backend',
            '--enable-tcp-fast-open',
            '--prerender-from-omnibox=disabled',
            '--enable-web-bluetooth=false',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-features=VizDisplayCompositor'
          ],
          timeout: 0,
          ...options
        });
      }
    };
  } else {
    // Local development configuration
    const puppeteerLocal = require('puppeteer');
    return puppeteerLocal;
  }
}

// Alternative configuration function for extra debugging
export async function launchBrowserWithRetry(maxRetries = 3) {
  const puppeteer = setupPuppeteer();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🚀 Browser launch attempt ${i + 1}/${maxRetries}`);
      
      const browser = await puppeteer.launch({
        headless: true,
        timeout: 30000
      });
      
      console.log('✅ Browser launched successfully');
      return browser;
    } catch (error) {
      console.error(`❌ Browser launch attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw new Error(`Failed to launch browser after ${maxRetries} attempts: ${error}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}