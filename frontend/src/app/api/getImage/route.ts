import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// puppeteer.use(StealthPlugin());

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    console.log("Scraping URL:", url); // Debugging

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    console.log("Navigating to page...");
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("Extracting media...");

    const mediaUrls = await page.evaluate(() => {
      // Check for video (Reel)
      const videoElement = document.querySelector("video");
      if (videoElement) {
        return { type: "video", url: videoElement.src };
      }

      // Otherwise, grab images (normal post)
      const imageElements = Array.from(document.querySelectorAll("img"));
      const imageUrls = imageElements.map((img) => img.src);
      return { type: "image", url: imageUrls[0] || null };
    });

    await browser.close();
    console.log("Scraping complete:", mediaUrls);

    return NextResponse.json({ media: mediaUrls });

  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape Instagram" }, { status: 500 });
  }
}
