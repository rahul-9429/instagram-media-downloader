import { Protocol } from "puppeteer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },{
        protocol: "https",
        hostname: "*.ytimg.com",
      }
    ],
  },
};

module.exports = nextConfig;
