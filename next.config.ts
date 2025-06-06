/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables for Clerk
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
  
  // Fix ESLint build issues
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Force dynamic rendering for pages with authentication
  output: 'standalone',

  // @ts-ignore
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Avoid bundling these packages in the client
      config.externals.push("chrome-aws-lambda");
    } else {
      // Optional: ignore Puppeteer source map warnings
      config.module.rules.push({
        test: /\.map$/,
        use: 'ignore-loader',
      });
    }
    return config;
  },

  // Keep puppeteer-related packages server-side only
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "chrome-aws-lambda",
  ],

  images: {
    domains: [
      'i.ytimg.com',
      'd3njjcbhbojbot.cloudfront.net',
      'img-c.udemycdn.com',
      'miro.medium.com',
      'assets.aceternity.com',
      'img.clerk.com',
      'yt3.ggpht.com'
    ],
  },
};

module.exports = nextConfig;