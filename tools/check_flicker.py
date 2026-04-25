"""Take rapid screenshots of CC2D while moving to check for flicker."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://cubiccraft.leaflune.org/2D/"
OUT = Path(__file__).parent / "rr_frames"

async def main():
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 600, "height": 750})
        page = await ctx.new_page()
        page.on("console", lambda m: print(f"[{m.type}] {m.text}"))
        await page.goto(URL, wait_until="load")
        await page.wait_for_timeout(3000)

        # Hold W for 2 seconds while shooting 30 frames at ~60ms apart
        await page.keyboard.down("w")
        for i in range(30):
            await page.screenshot(path=str(OUT / f"chk_{i:02d}.png"))
            await page.wait_for_timeout(60)
        await page.keyboard.up("w")
        await page.wait_for_timeout(500)

        await ctx.close()
        await browser.close()
        print("Done.")

asyncio.run(main())
