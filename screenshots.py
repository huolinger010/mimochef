"""Capture 1920x1080 desktop screenshots for MimoChef submission pack."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import time

OUT = Path("/root/mimochef/shots")
OUT.mkdir(exist_ok=True)
LIVE = "https://huolinger010.github.io/mimochef/"
REPO = "https://github.com/huolinger010/mimochef"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    ctx = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        device_scale_factor=1,
        locale="en-US",
    )
    page = ctx.new_page()

    # Shot 1: dark / EN hero — empty state
    print("Shot 1: dark/EN hero")
    page.goto(LIVE, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    page.screenshot(path=str(OUT / "01_dark_en_hero.png"), full_page=False)

    # Shot 2: dark / EN with results
    print("Shot 2: dark/EN with results")
    page.fill("#ingredients-input", "tempeh, chili, shallot, garlic")
    page.click("#find-btn")
    time.sleep(1.5)
    # Scroll down to show results section
    page.evaluate("document.getElementById('results').scrollIntoView({block:'start'})")
    time.sleep(1)
    page.evaluate("window.scrollBy(0, -80)")  # leave nav room
    time.sleep(1)
    page.screenshot(path=str(OUT / "02_dark_en_results.png"), full_page=False)

    # Shot 3: chat panel open with conversation
    print("Shot 3: chat panel open")
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)
    page.click("#chat-fab")
    time.sleep(0.5)
    page.fill("#chat-input", "Cara bikin rendang biar empuk?")
    page.click("#chat-send")
    # Wait for chat reply
    print("  waiting for Chef MiMo reply...")
    for _ in range(30):
        time.sleep(1)
        msg_count = page.evaluate("document.querySelectorAll('.msg.bot').length")
        if msg_count >= 2:  # greeting + reply
            break
    time.sleep(2)
    page.screenshot(path=str(OUT / "03_chat_open.png"), full_page=False)

    # Shot 4: light / ID — full bilingual + theme demo
    print("Shot 4: light/ID")
    # Close chat
    page.click("#chat-close")
    time.sleep(0.3)
    # Toggle theme to light
    page.click("#theme-btn")
    time.sleep(0.3)
    # Toggle lang to ID
    page.click("#lang-btn")
    time.sleep(0.5)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)
    page.screenshot(path=str(OUT / "04_light_id_hero.png"), full_page=False)

    # Shot 5: light / ID results scrolled
    print("Shot 5: light/ID results")
    page.evaluate("document.getElementById('results').scrollIntoView({block:'start'})")
    time.sleep(0.5)
    page.evaluate("window.scrollBy(0, -80)")
    time.sleep(1)
    page.screenshot(path=str(OUT / "05_light_id_results.png"), full_page=False)

    # Shot 6: GitHub repo
    print("Shot 6: GitHub repo")
    page.goto(REPO, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    page.screenshot(path=str(OUT / "06_github_repo.png"), full_page=False)

    browser.close()

print("\n6 screenshots saved to:", OUT)
for f in sorted(OUT.glob("*.png")):
    print(f"  {f.name}: {f.stat().st_size // 1024} KB")
