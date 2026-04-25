"""
Screenshot CC2D iframe during RR training to diagnose flicker.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://reinforcelab.vercel.app/?game=https://cubiccraft.leaflune.org/2D"
OUT_DIR = Path(__file__).parent / "rr_frames"

async def main():
    OUT_DIR.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(
            viewport={"width": 1280, "height": 800},
        )
        page = await ctx.new_page()
        page.on("console", lambda m: print(f"[main] {m.type}: {m.text}"))

        print("Opening RR+CC2D...")
        await page.goto(URL, wait_until="load")
        print("Waiting 5s for init...")
        await page.wait_for_timeout(5000)

        # find CC2D iframe element for screenshotting
        cc2d_iframe_el = await page.query_selector("iframe")
        if cc2d_iframe_el:
            print("Found iframe element")
        else:
            print("No iframe found, will screenshot full page")

        # Take 20 screenshots at 200ms intervals (~4 seconds)
        print("Taking screenshots...")
        for i in range(20):
            path = str(OUT_DIR / f"frame_{i:02d}.png")
            if cc2d_iframe_el:
                await cc2d_iframe_el.screenshot(path=path)
            else:
                await page.screenshot(path=path)
            await page.wait_for_timeout(200)

        print("Done.")
        await ctx.close()
        await browser.close()

asyncio.run(main())
