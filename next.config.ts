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
};

module.exports = nextConfig;