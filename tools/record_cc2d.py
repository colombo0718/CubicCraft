"""
Quick Playwright recording of CC2D game to check if physics is working.
Records ~8 seconds, presses WASD to move the craft.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://cubiccraft.leaflune.org/2D/"
OUT = Path(__file__).parent / "cc2d_test.webm"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=str(Path(__file__).parent),
            record_video_size={"width": 1280, "height": 720},
        )
        page = await ctx.new_page()

        # Collect console logs so we can see which physics engine loaded
        page.on("console", lambda m: print(f"[console] {m.type}: {m.text}"))
        page.on("pageerror", lambda e: print(f"[error] {e}"))

        print("Opening CC2D...")
        await page.goto(URL, wait_until="load")

        # Give physics worker time to initialize (Rapier needs to fetch WASM)
        print("Waiting 4s for physics worker to init...")
        await page.wait_for_timeout(4000)

        print("Pressing keys to move craft...")
        # Tap W (up engine) for 1 second
        await page.keyboard.down("w")
        await page.wait_for_timeout(1000)
        await page.keyboard.up("w")

        await page.wait_for_timeout(500)

        # Tap D (right engine)
        await page.keyboard.down("d")
        await page.wait_for_timeout(1000)
        await page.keyboard.up("d")

        await page.wait_for_timeout(500)

        # Tap S (down engine)
        await page.keyboard.down("s")
        await page.wait_for_timeout(1000)
        await page.keyboard.up("s")

        await page.wait_for_timeout(1000)

        print("Done. Closing...")
        await ctx.close()
        await browser.close()

        # Rename the recorded video
        videos = list(Path(__file__).parent.glob("*.webm"))
        if videos:
            latest = max(videos, key=lambda f: f.stat().st_mtime)
            latest.rename(OUT)
            print(f"Video saved: {OUT}")
        else:
            print("No video file found.")

asyncio.run(main())
