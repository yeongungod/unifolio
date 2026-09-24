// Run via Playwright browser_run_code_unsafe(code=file contents).
// Start npm run dev -- --host 127.0.0.1 --port 4460 first.
async (page) => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const results = [];
  for (const rows of [2]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://127.0.0.1:4460/#clients');
    const section = page.locator('#clients');
    const viewport = section.locator('.clients-window');
    await viewport.evaluate(e => e.blur());
    const track = section.locator('#clients-track');
    const x = () => track.evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m41);
    check(await section.locator('button').count() === 0, 'removed control remains');
    check(await section.locator('img').evaluateAll(es => es.every(e => getComputedStyle(e).filter === 'none')), 'logo color filter remains');
    check(await section.locator('img[alt="RAVNUS"]').getAttribute('src') === '/images/clients/ravnus.webp', 'RAVNUS color source');
    check(!(await section.innerText()).includes('개업 전'), 'removed note remains');
    check(await section.evaluate(e => getComputedStyle(e).backgroundColor === getComputedStyle(document.body).backgroundColor), 'background differs');
    for (const width of [320, 375, 768, 1967, 2560]) {
      await page.setViewportSize({ width, height: 1065 });
      await section.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow');
      const images = await section.locator('ul').first().locator('img').evaluateAll(es => es.map(e => ({ name: e.alt, loaded: e.complete && e.naturalWidth > 0 })));
      check(images.length === 12 && images.every(e => e.loaded && e.name), 'missing logo');
      const count = await section.locator('ul').first().locator('li').evaluateAll(es => new Set(es.map(e => Math.round(e.getBoundingClientRect().top))).size);
      check(count === rows, 'row count');
      const before = await x(); await page.waitForTimeout(150);
      check(await x() < before, 'not moving left');
      check(await track.evaluate(e => e.children[0].getBoundingClientRect().width >= e.parentElement.clientWidth), 'cycle shorter than viewport');
      results.push({ rows, width, images: 12, leftward: true, overflow: false });
    }
    await viewport.hover();
    const hovered = await x(); await page.waitForTimeout(150);
    check(Math.abs(await x() - hovered) < 0.1, 'hover pause');
    await viewport.click();
    await page.mouse.move(0, 0);
    const clicked = await x(); await page.waitForTimeout(150);
    check(await x() < clicked, 'pointer click leaves animation stuck');
    await viewport.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const focused = await x(); await page.waitForTimeout(150);
    check(Math.abs(await x() - focused) < 0.1, 'focus pause');
    const seam = await track.evaluate(e => {
      const a = e.getAnimations()[0]; a.pause(); a.currentTime = 0;
      const first = e.children[0].firstElementChild.getBoundingClientRect().x;
      a.currentTime = Number(a.effect.getTiming().duration) - 1;
      return Math.abs(first - e.children[1].firstElementChild.getBoundingClientRect().x);
    });
    check(seam < 1, 'loop seam');
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    check(await section.locator('ul[aria-hidden]').isHidden(), 'reduced duplicate visible');
    check(await track.evaluate(e => getComputedStyle(e).animationName === 'none'), 'reduced animation running');
    check(await section.locator('ul').first().locator('img').evaluateAll(es => es.every(e => e.getBoundingClientRect().left >= 0 && e.getBoundingClientRect().right <= innerWidth)), 'reduced clipped logo');
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1967, height: 1065 });
  await page.goto('http://127.0.0.1:4460/#clients');
  return { results, hoverPause: true, keyboardFocusPause: true, seamless: true, reducedMotion: true };
}
