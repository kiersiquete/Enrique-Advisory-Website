import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

// Use a local Playwright installation, or the host's bundled module path.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5173";
const output = "output/website-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const sentRequests = [];

try {
  for (const width of [1440, 1024, 390, 320]) {
    for (const language of ["en", "es"]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
      });
      await context.addInitScript(() =>
        localStorage.setItem("gilbert_devlyn_cookie_consent", "accepted"),
      );
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      // Do not let UI verification send reports or real contact requests.
      await page.route("**/api/**", (route) => {
        if (route.request().method() !== "GET") {
          sentRequests.push(route.request().url());
          return route.abort();
        }
        return route.continue();
      });
      await page.goto(`${baseUrl}/diagnostic?lang=${language}`);
      const start =
        language === "en" ? "Start Self-Assessment" : "Iniciar autoevaluación";
      const consent =
        language === "en"
          ? "I understand and agree - begin"
          : "Entiendo y acepto, empezar";
      const privacy =
        language === "en" ? "Privacy Policy" : "Política de privacidad";
      await page
        .getByRole("button", { name: start, exact: true })
        .first()
        .click();
      await page.getByRole("button", { name: consent, exact: true }).click();
      const dialog = page.locator("dialog.profile-dialog");
      await dialog.waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      const details = dialog.locator(".profile-process");
      if (width < 960) {
        assert.equal(await details.evaluate((el) => el.open), false);
        await details.locator("summary").click();
      }
      assert.equal(
        await details.locator(".assessment-steps").isVisible(),
        true,
      );
      assert.ok(
        (await details.locator(".profile-result-includes li").count()) > 0,
      );
      await dialog
        .locator('input[autocomplete="name"]')
        .fill("UI verification");
      assert.equal(
        await details.evaluate((el) => el.open),
        true,
        "editing must not collapse the explanation",
      );
      if (width < 960) await details.locator("summary").click();

      const phone = dialog.locator("#profile-phone");
      await phone.focus();
      await phone.scrollIntoViewIfNeeded();
      const toolbarBounds = await dialog
        .locator(".profile-dialog-toolbar")
        .boundingBox();
      const bodyBounds = await dialog
        .locator(".profile-dialog-body")
        .boundingBox();
      assert.ok(
        bodyBounds.y >= toolbarBounds.y + toolbarBounds.height,
        "the close toolbar must not overlap scrolling content",
      );
      const focus = await phone.evaluate((el) => ({
        inner: getComputedStyle(el).outlineStyle,
        outer: getComputedStyle(el.parentElement).outlineStyle,
        width: getComputedStyle(el.parentElement).outlineWidth,
      }));
      assert.equal(
        focus.inner,
        "none",
        "the input must not draw a second outline",
      );
      assert.equal(
        focus.outer,
        "solid",
        "the whole phone field must have a focus indicator",
      );
      assert.equal(focus.width, "2px");
      await page.screenshot({
        path: `${output}/phone-focus-${language}-${width}.png`,
      });

      const country = dialog.locator(".profile-phone-country");
      await country.click();
      const menu = dialog.locator("#profile-phone-countries");
      await menu.waitFor({ state: "visible" });
      assert.equal(
        await menu
          .locator("input")
          .evaluate((el) => el === document.activeElement),
        true,
      );
      const bounds = await menu.boundingBox();
      assert.ok(
        bounds.x >= 0 && bounds.x + bounds.width <= width,
        "phone country menu must fit the viewport",
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await dialog.isVisible(),
        true,
        "Escape in the country menu must not close the profile",
      );
      assert.equal(
        await country.evaluate((el) => el === document.activeElement),
        true,
      );
      await country.click();
      await menu.locator("input").fill("+1");
      const option = menu.locator('button[aria-pressed="false"]').first();
      const selectedLabel = await option.getAttribute("aria-label");
      await option.click();
      assert.equal(await country.getAttribute("aria-label"), selectedLabel);
      assert.equal(
        await country.evaluate((el) => el === document.activeElement),
        true,
      );

      await phone.fill("1");
      const residence = dialog.getByRole("button", { name: language === "en" ? "Country" : "País", exact: true });
      await residence.click();
      assert.equal(await dialog.locator(".profile-country-search input").evaluate(el => el === document.activeElement), true);
      await page.keyboard.press("Escape");
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await residence.evaluate(el => el === document.activeElement), true);
      await dialog.getByRole("button", { name: start, exact: true }).click();
      assert.equal(await phone.getAttribute("aria-invalid"), "true");
      assert.equal(
        await dialog.locator("#profile-phone-error").isVisible(),
        true,
      );
      assert.equal(
        await dialog
          .getByRole("button", { name: privacy, exact: true })
          .isVisible(),
        true,
      );
      const dimensions = await dialog.locator(".profile-dialog-body").evaluate((el) => ({
        width: el.clientWidth,
        scrollWidth: el.scrollWidth,
      }));
      assert.ok(
        dimensions.scrollWidth <= dimensions.width + 1,
        JSON.stringify(dimensions),
      );
      await dialog.getByRole("button", { name: privacy, exact: true }).click();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "visible" });
      assert.equal(
        await dialog.locator('input[autocomplete="name"]').inputValue(),
        "UI verification",
      );
      for (let i = 0; i < 24; i++) {
        await page.keyboard.press("Tab");
        assert.equal(
          await dialog.evaluate((el) => el.contains(document.activeElement)),
          true,
        );
      }
      console.log(
        `Profile ${language} ${width}: focus, country menu, explanations, validation and privacy OK`,
      );
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(sentRequests, []);
} finally {
  await browser.close();
}
