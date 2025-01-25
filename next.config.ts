/** @type {import('next').NextConfig} */
const nextConfig = {
  //@ts-ignore
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "puppeteer",
        "puppeteer-extra",
        "puppeteer-extra-plugin-stealth",
      ];
    }
    return config;
  },
  // Use `serverExternalPackages` instead of `experimental.serverComponentsExternalPackages`
  serverExternalPackages: [
    "puppeteer-core",
    "puppeteer",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
  ],
  images: {
    domains: ['i.ytimg.com','d3njjcbhbojbot.cloudfront.net','img-c.udemycdn.com','miro.medium.com','assets.aceternity.com','img.clerk.com'], 
  },
};

module.exports = nextConfig;