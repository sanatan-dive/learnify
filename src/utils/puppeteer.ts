// utils/puppeteer.ts
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

let isPluginInitialized = false;

export function setupPuppeteer() {
  // Only initialize the plugin once
  if (!isPluginInitialized) {
    puppeteer.use(StealthPlugin());
    isPluginInitialized = true;
  }
  return puppeteer;
}

// Browser configuration
export const BROWSER_CONFIG = {
  headless: "new",
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ],
  // Add explicit path to Chrome if needed
  // executablePath: process.platform === 'win32' 
  //   ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  //   : '/usr/bin/google-chrome',
};