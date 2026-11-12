import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { COPY, FULL_QUESTIONS } from "../src/data/assessment.js";
import { WEBSITE_COPY } from "../src/data/website.js";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5173";
const output = "output/mobile";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const sizes = [
  [320, 740], [390, 844], [430, 932], [844, 390], [768, 1024], [1024, 900], [1280, 900], [1440, 1000],
];

async function checkLayout(page, label) {
  const issues = await page.evaluate(() => {
    const issues = [];
    for (const el of document.querySelectorAll("h1,h2,h3,p,button,a,input,select,article,svg text")) {
      if (!el.getClientRects().length) continue;
      const box = el.getBoundingClientRect();
      const text = el.textContent.trim().slice(0, 65);
      if (box.left < -1 || box.right > innerWidth + 1) issues.push({ text, reason: "viewport overflow" });
      if (el.matches("h1,h2,h3,button,p") && el.scrollWidth > el.clientWidth + 1) {
        issues.push({ text, reason: "content overflow" });
      }
    }
    return issues;
  });
  assert.deepEqual(issues, [], `${label}: ${JSON.stringify(issues)}`);
}

async function loadImages(page) {
  await page.evaluate(async () => {
    // Visit the complete page so lazy images are included in visual checks.
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    await Promise.all([...document.images].map(img => {
      img.loading = "eager";
      return img.decode().catch(() => {});
    }));
    scrollTo(0, 0);
  });
  const broken = await page.locator("img").evaluateAll(images => images.filter(img => !img.naturalWidth).map(img => img.src));
  assert.deepEqual(broken, [], "all page images load");
}

try {
  for (const [width, height] of sizes) {
    for (const language of ["en", "es"]) {
      const context = await browser.newContext({
        viewport: { width, height }, reducedMotion: "reduce", hasTouch: width < 1024,
        isMobile: width < 960,
      });
      await context.addInitScript(() => localStorage.setItem("gilbert_devlyn_cookie_consent", "accepted"));
      let saveAttempts = 0;
      let groupFull = false;
      const submissions = [];
      // No request in this suite may write data or send a real email.
      await context.route("**/api/**", async route => {
        const request = route.request();
        if (request.method() === "POST" && new URL(request.url()).pathname === "/api/results") {
          saveAttempts++;
          submissions.push(request.postDataJSON());
          await new Promise(resolve => setTimeout(resolve, 150));
          return route.fulfill(saveAttempts === 1
            ? { status: 500, json: { error: "Unable to save assessment result" } }
            : { json: { ok: true, persistence: "airtable", email: { sent: true } } });
        }
        assert.equal(request.method(), "GET", `unexpected mutation: ${request.url()}`);
        return route.fulfill({ json: { ok: true, participantCount: groupFull ? 3 : 1, maxParticipants: 3 } });
      });
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      const copy = COPY[language];
      const website = WEBSITE_COPY[language];
      const suffix = `${language}-${width}x${height}`;
      const routes = {
        home: language === "en" ? "/english" : "/spanish",
        about: `/about?lang=${language}`,
        services: `/services?lang=${language}`,
        assessment: `/diagnostic?lang=${language}`,
        results: `/?mock-results=1&lang=${language}`,
        invite: `/diagnostic?view=invite&group=${"a".repeat(32)}&lang=${language}`,
        comparison: `/?mock-comparison=3&lang=${language}`,
      };
      for (const [name, path] of Object.entries(routes)) {
        await page.goto(`${baseUrl}${path}`);
        await page.evaluate(() => document.fonts.ready);
        await loadImages(page);
        if (name === "results") {
          await page.locator(".recharts-radar-polygon").waitFor();
          const plot = await page.locator(".recharts-polar-grid").boundingBox();
          assert.ok(plot.width >= 160, `radar plot too small: ${plot.width}`);
          const labels = await page.locator(".recharts-polar-angle-axis-tick-value").all();
          const boxes = await Promise.all(labels.map(label => label.boundingBox()));
          const chartBounds = await page.locator(".results-chart").boundingBox();
          assert.ok(boxes.every(box => box.x >= chartBounds.x + 2 && box.x + box.width <= chartBounds.x + chartBounds.width - 2), "radar labels fit inside the chart panel");
          for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i], b = boxes[j];
              assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, "radar labels must not overlap");
            }
          }
          await page.locator(".results-chart").screenshot({ path: `${output}/chart-${suffix}.png` });
          await page.locator(".assessment-results > div").first().screenshot({ path: `${output}/summary-${suffix}.png` });
          await page.locator("#diagnostic-breakdown").screenshot({ path: `${output}/topics-${suffix}.png` });
        }
        await checkLayout(page, `${name}-${suffix}`);
        if (["home", "about", "services", "assessment"].includes(name) && width <= 390) {
          await page.screenshot({ path: `${output}/viewport-${name}-${suffix}.png` });
          await page.locator(".site-footer").screenshot({ path: `${output}/footer-${suffix}.png` });
        }
        await page.screenshot({ path: `${output}/${name}-${suffix}.png`, fullPage: true });
      }
      if (width < 960) {
        await page.goto(`${baseUrl}${routes.home}`);
        await page.locator(".site-menu-toggle").tap();
        const menu = page.locator("#mobile-navigation");
        assert.equal(await menu.isVisible(), true);
        const bounds = await menu.boundingBox();
        assert.ok(bounds.y + bounds.height <= height + 1, "menu fits short screens");
        await menu.getByRole("link", { name: copy.nav.about, exact: true }).tap();
        assert.equal(await menu.count(), 0, "navigation closes menu");
        assert.equal(new URL(page.url()).pathname, "/about");
        await page.getByRole("button", { name: language === "en" ? "ES" : "EN", exact: true }).tap();
        assert.equal(new URL(page.url()).searchParams.get("lang"), language === "en" ? "es" : "en");
      }

      // Complete actual intake and all 50 questions on narrow, standard and landscape phones.
      if ([320, 390, 844].includes(width)) {
        await page.evaluate(() => localStorage.removeItem("family-business-maturity-latest"));
        await page.goto(`${baseUrl}${routes.assessment}`);
        await page.getByRole("button", { name: website.begin, exact: true }).first().tap();
        await page.getByRole("button", { name: copy.preAssessmentPrivacy.secondaryCta, exact: true }).tap();
        const policy = page.getByRole("dialog").filter({ has: page.locator("#privacy-policy-title") });
        await checkLayout(page, `privacy-${suffix}`);
        await policy.getByRole("button", { name: copy.privacyPolicy.close, exact: true }).last().tap();
        await page.getByRole("button", { name: copy.preAssessmentPrivacy.primaryCta, exact: true }).tap();
        const dialog = page.locator("dialog.profile-dialog");
        await dialog.waitFor({ state: "visible" });
        await dialog.locator('input[autocomplete="name"]').fill("Mobile QA Test");
        await dialog.locator('input[type="email"]').fill("mobile-qa@example.com");
        await dialog.locator("#profile-phone").fill("55 1234 5678");
        await dialog.locator("select").nth(0).selectOption({ index: 1 });
        await dialog.locator("select").nth(1).selectOption({ index: 1 });
        await checkLayout(page, `profile-${suffix}`);
        await dialog.locator('button[type="submit"]').tap();
        const flow = page.locator(".assessment-flow");
        await flow.waitFor();
        const actions = flow.locator(".assessment-question-actions");
        const unknownPillar = FULL_QUESTIONS[language].find(question => question.pillarId !== FULL_QUESTIONS[language][0].pillarId).pillarId;
        for (let i = 0; i < FULL_QUESTIONS[language].length; i++) {
          await page.waitForFunction(text => document.querySelector(".assessment-flow h1")?.textContent === text, FULL_QUESTIONS[language][i].text);
          await page.waitForFunction(() => scrollY === 0);
          assert.equal(await actions.getByRole("button").last().isDisabled(), true);
          const answer = i % 7 === 6 || FULL_QUESTIONS[language][i].pillarId === unknownPillar
            ? flow.getByRole("button", { name: new RegExp(copy.unknownOption.label) })
            : flow.locator(".assessment-answers button").nth(i % 6);
          await answer.tap();
          assert.equal(await answer.getAttribute("aria-pressed"), "true");
          if (i === 2) {
            await page.reload();
            await page.getByRole("button", { name: copy.resumeAssessment.continueCta, exact: true }).tap();
            await flow.waitFor();
            assert.equal(await answer.getAttribute("aria-pressed"), "true", "progress survives reload and resume");
            await page.waitForFunction(() => scrollY === 0);
          }
          if (i === 1) {
            await actions.getByRole("button").first().tap();
            await page.waitForFunction(text => document.querySelector(".assessment-flow h1")?.textContent === text, FULL_QUESTIONS[language][0].text);
            await page.waitForFunction(() => scrollY === 0);
            assert.equal(await flow.locator(".assessment-answers button").nth(0).getAttribute("aria-pressed"), "true");
            await actions.getByRole("button").last().tap();
            await page.waitForFunction(text => document.querySelector(".assessment-flow h1")?.textContent === text, FULL_QUESTIONS[language][1].text);
          }
          await checkLayout(page, `question-${i + 1}-${suffix}`);
          if ([0, 24, 49].includes(i)) await flow.screenshot({ path: `${output}/question-${i + 1}-${suffix}.png` });
          await actions.getByRole("button").last().tap();
        }
        const results = page.locator(".assessment-results");
        await results.waitFor();
        await page.waitForFunction(() => scrollY === 0);
        await page.locator(".recharts-radar-polygon").waitFor();
        assert.ok(await results.getByText(copy.noScore, { exact: true }).count(), "unscored topics remain readable");
        await checkLayout(page, `completed-results-${suffix}`);
        await results.getByRole("checkbox").check();
        const save = results.locator("button").last();
        await save.tap();
        assert.equal(await save.isDisabled(), true, "pending saves cannot be tapped twice");
        await results.getByRole("alert").waitFor();
        await checkLayout(page, `save-error-${suffix}`);
        assert.equal(await save.isEnabled(), true, "failed save can be retried");
        await save.tap();
        await results.getByRole("status").waitFor();
        assert.equal(await save.isDisabled(), true);
        assert.equal(saveAttempts, 2);
        assert.equal(submissions[1].language, language);
        assert.equal(submissions[1].profile.email, "mobile-qa@example.com");
        assert.equal(submissions[1].reportRequest.contactRequested, true);
        assert.equal(Object.keys(submissions[1].answers).length, 50);
        await checkLayout(page, `saved-results-${suffix}`);
        await page.screenshot({ path: `${output}/saved-${suffix}.png` });

        await page.goto(`${baseUrl}${routes.invite}`);
        await page.locator('input[type="email"]').waitFor();
        await page.locator('input[type="email"]').fill("invalid");
        await page.getByRole("button", { name: copy.comparison.generateInvite, exact: true }).tap();
        await page.getByRole("alert").waitFor();
        await checkLayout(page, `invite-error-${suffix}`);
        groupFull = true;
        await page.reload();
        await page.waitForFunction(() => !document.querySelector('input[type="email"]'));
        await checkLayout(page, `invite-full-${suffix}`);
      }
      await context.close();
      console.log(`PASS ${suffix}`);
    }
  }
  for (const [width, height] of [[320, 480], [844, 320]]) {
    for (const language of ["en", "es"]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: true, isMobile: true });
      await context.route("**/api/**", route => route.abort());
      const page = await context.newPage();
      const copy = COPY[language];
      await page.goto(`${baseUrl}/${language === "en" ? "english" : "spanish"}`);
      const accept = page.getByRole("button", { name: copy.cookieConsent.accept, exact: true });
      await accept.waitFor();
      await checkLayout(page, `cookie-${language}-${width}`);
      await page.getByRole("button", { name: copy.cookieConsent.privacyLink, exact: true }).first().tap();
      const policy = page.getByRole("dialog");
      await policy.waitFor();
      await policy.getByRole("button", { name: copy.privacyPolicy.close, exact: true }).last().tap();
      await accept.tap();
      assert.equal(await accept.count(), 0);
      await context.close();
    }
  }
  assert.deepEqual(errors, [], "no uncaught browser errors");
  console.log("Mobile pages, navigation, intake, 300 question transitions and mocked save/retry flows passed.");
} finally {
  await browser.close();
}
