import { chromium } from "playwright";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "qa", "screenshots");
const baseUrl = process.env.QA_URL || "http://127.0.0.1:4174/";
await fs.mkdir(output, { recursive: true });

const sharedChromium = path.resolve(root, "../../tooling/media/.browsers/chromium-1248/chrome-win64/chrome.exe");
const browser = await chromium.launch({ headless: true, ...(existsSync(sharedChromium) ? { executablePath: sharedChromium } : {}) });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

async function assertNavigationFit(deviceName) {
  const layout = await page.evaluate(() => {
    const screen = document.querySelector(".device-screen");
    const nav = document.querySelector(".bottom-navigation");
    if (!screen || !nav) return null;
    const screenRect = screen.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const safeBottom = Number.parseFloat(getComputedStyle(screen).getPropertyValue("--device-safe-area-bottom")) || 0;
    const buttons = Array.from(nav.querySelectorAll("button")).map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return { screen: { left: screenRect.left, right: screenRect.right, bottom: screenRect.bottom }, nav: { left: navRect.left, right: navRect.right, bottom: navRect.bottom }, safeBottom, buttons };
  });
  if (!layout) throw new Error(`${deviceName}: bottom navigation is missing`);
  if (layout.nav.left < layout.screen.left || layout.nav.right > layout.screen.right || layout.nav.bottom > layout.screen.bottom - layout.safeBottom) {
    throw new Error(`${deviceName}: bottom navigation overlaps the system safe area: ${JSON.stringify(layout)}`);
  }
  if (layout.buttons.some((button) => button.width < 44 || button.height < 44)) throw new Error(`${deviceName}: navigation touch targets are too small`);
}

async function resetPhoneScroll() {
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = 0; });
  await page.getByTestId("device-screen").evaluate((screen) => { screen.scrollTop = 0; });
  await page.waitForTimeout(180);
}

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".mobile-cursor { opacity: 0 !important; pointer-events: none !important; }" });
  await page.locator(".doctor-app").waitFor();
  await page.waitForTimeout(350);
  if (!await page.locator(".auth-brand img").count() || !await page.getByText("مرحباً بعودتك").count()) throw new Error("App startup must show the branded login screen");
  if (await page.locator(".doctor-app").evaluate((element) => getComputedStyle(element).backgroundImage) !== "none" || !await page.locator(".auth-screen").evaluate((element) => getComputedStyle(element).backgroundImage.includes("linear-gradient"))) throw new Error("Login screen needs its own subtle background without the app watermark");
  if (!await page.locator(".auth-hero-card img").count() || await page.locator(".auth-role-picker-cards button").count() !== 3) throw new Error("Login needs its healthcare hero image and three clear account choices");
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-login-ar-1x.png") });
  await page.locator(".language-switch").click();
  if (!await page.getByText("Welcome back", { exact: true }).count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Branded login did not switch to English and LTR");
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-login-en-1x.png") });
  await page.locator(".language-switch").click();
  await page.locator(".auth-role-picker button").nth(1).click();
  if (!await page.getByText("الطبيب", { exact: true }).count()) throw new Error("Login role selector did not select the doctor role");
  await page.locator(".auth-role-picker button").first().click();
  await page.locator('input[type="email"]').fill("sarah@example.com");
  await page.locator('input[type="password"]').fill("demo-password");
  await page.locator(".auth-submit").click();
  if (!await page.getByText("كيف نقدر نساعدك اليوم؟").count()) throw new Error("Startup login did not open the app");
  const bubble = page.locator(".nav-active-bubble");
  const bubbleCenter = async () => bubble.evaluate((element) => { const rect = element.getBoundingClientRect(); return rect.left + rect.width / 2; });
  const activeIconCenter = async () => page.locator('.bottom-navigation button[aria-current="page"] .nav-icon').evaluate((element) => { const rect = element.getBoundingClientRect(); return rect.left + rect.width / 2; });
  const navCenter = await page.locator(".bottom-navigation").evaluate((element) => { const rect = element.getBoundingClientRect(); return rect.left + rect.width / 2; });
  await page.waitForTimeout(420);
  const homeBubbleCenter = await bubbleCenter();
  if (Math.abs(homeBubbleCenter - await activeIconCenter()) > 2 || Math.abs(homeBubbleCenter - navCenter) > 2) throw new Error("Home must be centered under its raised navigation bubble");
  if (!await page.locator('.bottom-navigation button[data-nav-item="health"] .health-pulse-icon').count()) throw new Error("Patient Health tab must use the heart-pulse icon");
  await page.locator('.bottom-navigation button[data-nav-item="appointments"]').click();
  await page.waitForTimeout(450);
  const appointmentsBubbleCenter = await bubbleCenter();
  if (Math.abs(appointmentsBubbleCenter - await activeIconCenter()) > 2 || Math.abs(appointmentsBubbleCenter - homeBubbleCenter) < 30) throw new Error("Bottom navigation bubble did not slide to the selected tab");
  await page.locator('.bottom-navigation button[data-nav-item="home"]').click();
  await page.waitForTimeout(450);

  await page.setViewportSize({ width: 1400, height: 1200 });
  await page.waitForTimeout(500);
  const iphoneScreen = page.getByTestId("device-screen");
  const iphoneBox = await iphoneScreen.boundingBox();
  if (!iphoneBox || Math.abs(iphoneBox.width - 393) > 1 || Math.abs(iphoneBox.height - 852) > 1) {
    throw new Error(`Expected an unscaled iPhone screen at 393 x 852, got ${iphoneBox?.width} x ${iphoneBox?.height}`);
  }
  await assertNavigationFit("iPhone");
  await page.locator('.bottom-navigation button[aria-current="page"]').waitFor();
  await resetPhoneScroll();
  await page.mouse.move(1, 1);
  await iphoneScreen.screenshot({ path: path.join(output, "iphone-home-ar-1x.png") });
  const comparison = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
  await comparison.goto(new URL("qa/compare-home.html", baseUrl).href, { waitUntil: "networkidle" });
  await comparison.screenshot({ path: path.join(output, "home-source-comparison.png"), fullPage: true });
  await comparison.close();

  const sizes = [
    ["mobile", 390, 844, 1],
    ["small-mobile-short", 320, 640, 1],
    ["tablet", 768, 900, 1],
    ["desktop-short", 1366, 640, 1],
    ["desktop-125", 1366, 768, 1.25],
    ["desktop-150", 1536, 864, 1.5],
  ];
  for (const [name, width, height, zoom] of sizes) {
    const effectiveWidth = Math.round(width / zoom);
    const effectiveHeight = Math.round(height / zoom);
    await page.setViewportSize({ width: effectiveWidth, height: effectiveHeight });
    await page.evaluate(() => { document.documentElement.style.zoom = "1"; });
    await page.waitForTimeout(180);
    const dimensions = await page.evaluate(() => ({
      viewport: [window.innerWidth, window.innerHeight],
      document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
      phone: (() => { const rect = document.querySelector(".phone-scale-box")?.getBoundingClientRect(); return rect ? { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null; })(),
      screen: (() => { const rect = document.querySelector(".device-screen")?.getBoundingClientRect(); return rect ? { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null; })(),
      appOverflow: (() => { const scroll = document.querySelector(".mobile-scroll"); return scroll ? scroll.scrollWidth - scroll.clientWidth : 0; })(),
    }));
    if (dimensions.phone && (dimensions.phone.x < -1 || dimensions.phone.y < -1 || dimensions.phone.right > effectiveWidth + 1 || dimensions.phone.bottom > effectiveHeight + 1)) {
      throw new Error(`${name}: device frame exceeds viewport: ${JSON.stringify(dimensions.phone)}`);
    }
    if (dimensions.appOverflow > 1) throw new Error(`${name}: app content overflows horizontally by ${dimensions.appOverflow}px`);
    await page.screenshot({ path: path.join(output, `${name}-patient-ar.png`) });
    console.log(`${name} (effective ${effectiveWidth}x${effectiveHeight}; simulated ${zoom * 100}%): ${JSON.stringify(dimensions)}`);
  }

  await page.evaluate(() => { document.documentElement.style.zoom = "1"; });
  await page.setViewportSize({ width: 1400, height: 1200 });
  await page.waitForTimeout(500);
  await page.locator(".language-switch").click();
  if (await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("English direction must be LTR");
  await page.screenshot({ path: path.join(output, "mobile-patient-en.png") });
  await page.locator(".quick-item").first().click();
  await page.locator(".message-mini").first().click();
  if (!await page.getByText("Doctor chat").count()) throw new Error("English doctor chat did not open");
  if (await page.locator(".chat-back").getAttribute("data-back-direction") !== "ltr") throw new Error("English chat back arrow must point to the English start side");
  await page.locator(".chat-input").fill("Could you help me with a question?");
  await page.locator(".send-message-button").click();
  if (!await page.getByText("Could you help me with a question?").count()) throw new Error("English chat did not send the message");
  await page.waitForTimeout(280);
  await page.screenshot({ path: path.join(output, "mobile-chat-en.png") });
  await page.locator(".chat-back").click();
  await page.locator(".screen-title .back-button").click();
  await page.locator(".language-switch").click();
  if (await page.locator(".doctor-app").getAttribute("dir") !== "rtl") throw new Error("Arabic direction must be RTL");

  await page.locator(".quick-item").nth(2).click();
  if (!await page.getByText("ابحث عن دواء").count() || !await page.getByText("رفع وصفة طبية").count() || !await page.getByText("طلب توصيل صيدلية").count()) throw new Error("Pharmacy quick action did not show its distinct choices");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-pharmacy-options-ar-1x.png") });
  await page.locator(".notice-sheet .sheet-close").click();
  await page.locator(".quick-item").nth(3).click();
  if (!await page.getByText("احجز تحليلاً").count() || !await page.getByText("استعرض التحاليل").count() || !await page.getByText("رفع طلب طبي").count()) throw new Error("Lab quick action did not show its distinct choices");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-lab-options-ar-1x.png") });
  await page.locator(".notice-sheet .sheet-close").click();
  await page.locator(".quick-item").first().click();
  if (await page.locator(".screen-title .back-button").getAttribute("data-back-direction") !== "rtl") throw new Error("Arabic back arrow must point to the RTL start side");
  await page.locator(".favorite-mini").first().click();
  if (await page.locator(".favorite-mini").first().getAttribute("aria-pressed") !== "true") throw new Error("Doctor favorite could not be saved");
  await page.locator('.bottom-navigation button[data-nav-item="favorites"]').click();
  if (!await page.getByText("أطبائي المفضلون").count() || !await page.locator(".full-doctor-list .doctor-card").count()) throw new Error("Saved doctor did not appear on the favorites screen");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-favorites-ar-1x.png") });
  await page.locator(".favorite-mini").first().click();
  if (!await page.getByText("لم تضف أطباء إلى المفضلة بعد").count()) throw new Error("Removing a favorite did not show the empty state");
  await page.locator(".favorites-empty .primary-button").click();
  await page.locator(".screen-title .back-button").click();

  await page.locator('.bottom-navigation button[data-nav-item="health"]').click();
  await page.locator(".health-edit-button").click();
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-health-edit-ar-1x.png") });
  await page.locator(".health-editor label").nth(1).locator("input").fill("120/80");
  await page.locator(".health-editor .primary-button").click();
  if (!await page.getByText("120/80").count()) throw new Error("Health record changes were not saved");
  await page.locator(".health-edit-button").click();
  await page.locator(".health-editor label").nth(1).locator("input").fill("118/78");
  await page.locator(".health-editor .primary-button").click();

  if (await page.locator(".health-list-item").count() !== 4 || !await page.locator(".health-hero-banner img").count()) throw new Error("Patient health screen is missing its illustrated background or health record sections");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-health-records-ar-1x.png") });
  await page.locator(".health-list-item").nth(0).click();
  if (!await page.getByText("الوصفات الطبية", { exact: true }).count() || !await page.locator(".health-record-card").count()) throw new Error("Prescription records did not open with saved details");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-prescriptions-ar-1x.png") });
  await page.locator(".health-record-card .edit-button").first().click();
  await page.locator(".health-record-editor label").first().locator("input").fill("Vitamin D3 QA");
  await page.locator(".health-record-editor button[type=submit]").click();
  if (!await page.getByText("Vitamin D3 QA").count()) throw new Error("Prescription details could not be edited and saved");
  await page.locator(".language-switch").click();
  if (!await page.getByText("Prescriptions", { exact: true }).count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Prescription records did not translate to English");
  await page.locator(".language-switch").click();
  await page.locator(".screen-title .back-button").click();
  await page.locator(".health-list-item").nth(1).click();
  if (!await page.getByText("نتائج التحاليل", { exact: true }).count()) throw new Error("Lab results page did not open");
  await page.locator(".add-family-button").click();
  await page.locator(".health-record-editor label").nth(0).locator("input").fill("Lipid profile QA");
  await page.locator(".health-record-editor label").nth(1).locator("textarea").fill("Cholesterol 170 mg/dL");
  await page.locator(".health-record-editor button[type=submit]").click();
  if (!await page.getByText("Lipid profile QA").count()) throw new Error("Lab result could not be added");
  await page.locator(".screen-title .back-button").click();
  await page.locator(".health-list-item").nth(2).click();
  await page.locator(".add-family-button").click();
  await page.locator(".health-record-editor label").nth(0).locator("input").fill("Dental visit QA");
  await page.locator(".health-record-editor label").nth(1).locator("textarea").fill("Routine check-up");
  await page.locator(".health-record-editor button[type=submit]").click();
  if (!await page.getByText("Dental visit QA").count()) throw new Error("Medical visit record could not be added");
  await page.locator(".screen-title .back-button").click();
  await page.locator(".health-list-item").nth(3).click();
  if (!await page.getByText("لا توجد حساسية مسجلة").count()) throw new Error("Allergy section did not show a clear empty state");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-allergies-ar-1x.png") });
  await page.locator(".add-family-button").click();
  await page.locator(".health-record-editor label").nth(0).locator("input").fill("Penicillin QA");
  await page.locator(".health-record-editor label").nth(1).locator("textarea").fill("Skin reaction");
  await page.locator(".health-record-editor button[type=submit]").click();
  if (!await page.getByText("Penicillin QA").count()) throw new Error("Allergy could not be added");
  await page.locator(".health-record-card .remove-item-button").click();
  if (!await page.getByText("لا توجد حساسية مسجلة").count()) throw new Error("Allergy could not be removed");
  await page.locator(".screen-title .back-button").click();
  await page.locator(".wellness-card").click();
  if (!await page.getByText("نصائح صحية", { exact: true }).count() || await page.locator(".wellness-check-row").count() !== 3) throw new Error("Health tips page did not open with daily check-ins");
  await page.locator(".wellness-check-row").first().click();
  if (await page.locator(".wellness-check-row").first().getAttribute("aria-pressed") !== "true") throw new Error("Daily wellness checklist did not update");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-wellness-ar-1x.png") });
  await page.locator(".language-switch").click();
  if (!await page.getByText("Health tips", { exact: true }).count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Health tips page did not translate to English");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-wellness-en-1x.png") });
  await page.locator(".screen-title .back-button").click();
  if (!await page.getByText("My health record", { exact: true }).count() || !await page.getByText("Your health record, clear and organized").count()) throw new Error("Illustrated health overview did not translate to English");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-health-records-en-1x.png") });
  for (const [index, title] of [[0, "Prescriptions"], [1, "Lab results"], [2, "Medical records"], [3, "Allergies"]]) {
    await page.locator(".health-list-item").nth(index).click();
    if (!await page.getByText(title, { exact: true }).count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error(`${title} page did not translate to English`);
    await page.locator(".screen-title .back-button").click();
  }
  await page.locator(".language-switch").click();

  await page.locator('.bottom-navigation button[data-nav-item="profile"]').click();
  await page.locator(".profile-card .edit-button").click();
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-edit-ar-1x.png") });
  await page.locator(".profile-editor label").first().locator("input").fill("Sarah Test");
  await page.locator(".profile-editor .primary-button").click();
  if (!await page.getByText("Sarah Test").count()) throw new Error("Profile edits were not saved");
  await page.locator(".profile-card .edit-button").click();
  await page.locator(".profile-editor label").first().locator("input").fill("Sarah Ahmed");
  await page.locator(".profile-editor .primary-button").click();
  const demoPhoto = path.join(root, "public", "assets", "doctors", "layla.jpg");
  await page.locator(".profile-photo-field input").setInputFiles(demoPhoto);
  await page.waitForFunction(() => document.querySelector(".profile-photo-field .profile-avatar img")?.getAttribute("src")?.startsWith("data:image/jpeg"));

  await page.locator(".profile-menu-item").nth(0).click();
  if (!await page.getByText("أفراد العائلة").count()) throw new Error("Family member management page did not open");
  await page.locator(".add-family-button").click();
  await page.locator(".family-editor label").nth(0).locator("input").fill("Lina QA");
  await page.locator(".family-editor label").nth(1).locator("select").selectOption("child");
  await page.locator(".family-editor label").nth(2).locator("input").fill("2018-02-14");
  await page.locator(".family-editor button[type=submit]").click();
  if (!await page.getByText("Lina QA").count()) throw new Error("Adding a family member did not update the list");
  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(0).click();
  if (!await page.getByText("Lina QA").count()) throw new Error("Family member changes were not persisted after navigating away");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-family-ar-1x.png") });
  await page.locator('.family-member-card').filter({ hasText: "Lina QA" }).locator(".edit-button").click();
  await page.locator(".family-editor label").nth(0).locator("input").fill("Lina Updated");
  await page.locator(".family-editor button[type=submit]").click();
  if (!await page.getByText("Lina Updated").count()) throw new Error("Editing a family member did not save");
  await page.locator('.family-member-card').filter({ hasText: "Lina Updated" }).locator(".remove-item-button").click();
  if (await page.getByText("Lina Updated").count()) throw new Error("Deleting a family member did not remove it");
  await page.locator(".language-switch").click();
  if (!await page.getByText("Family members").count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Family member screen did not translate to English");
  await page.locator(".language-switch").click();

  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(1).click();
  if (!await page.getByText("التأمين الصحي").count()) throw new Error("Insurance page did not open");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-insurance-ar-1x.png") });
  await page.locator(".insurance-form label").first().locator("input").fill("QA Health Plan");
  await page.locator(".insurance-form button[type=submit]").click();
  if (!await page.getByText("QA Health Plan").count()) throw new Error("Insurance details did not save");
  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(1).click();
  if (await page.locator(".insurance-form label").first().locator("input").inputValue() !== "QA Health Plan") throw new Error("Insurance details did not persist");
  await page.locator(".language-switch").click();
  if (!await page.getByText("Health insurance").count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Insurance screen did not translate to English");
  await page.locator(".language-switch").click();

  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(2).click();
  if (!await page.getByText("إعدادات الحساب").count()) throw new Error("Patient account settings did not open");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-settings-ar-1x.png") });
  const languagePreference = page.locator(".language-setting-card select");
  await languagePreference.selectOption("en");
  if (await page.locator(".doctor-app").getAttribute("dir") !== "ltr" || !await page.getByText("Account settings").count()) throw new Error("Settings language selector did not switch the app to English");
  const patientSettingToggle = page.locator('.workspace-settings-list .toggle-switch[role="switch"]').first();
  const originalPatientToggle = await patientSettingToggle.getAttribute("aria-checked");
  await patientSettingToggle.click();
  if (await patientSettingToggle.getAttribute("aria-checked") === originalPatientToggle) throw new Error("Patient account setting did not toggle");
  await languagePreference.selectOption("ar");

  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(3).click();
  if (!await page.getByText("الإشعارات").count() || await page.locator('.workspace-settings-list .toggle-switch[role="switch"]').count() !== 4) throw new Error("Notification preferences page did not open with its categories");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-notifications-ar-1x.png") });
  const notificationToggle = page.locator('.workspace-settings-list .toggle-switch[role="switch"]').first();
  const originalNotificationToggle = await notificationToggle.getAttribute("aria-checked");
  await notificationToggle.click();
  if (await notificationToggle.getAttribute("aria-checked") === originalNotificationToggle) throw new Error("Notification preference did not toggle");
  await page.locator(".language-switch").click();
  if (!await page.getByText("Notifications").count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Notification preferences did not translate to English");
  await page.locator(".language-switch").click();

  await page.locator(".screen-title .back-button").click();
  await page.locator(".profile-menu-item").nth(4).click();
  await page.locator(".language-switch").click();
  if (!await page.getByText("Frequently asked questions").count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("Support page did not translate to English");
  await page.locator(".language-switch").click();
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-profile-support-ar-1x.png") });
  await page.locator(".support-faq").first().locator("button").click();
  if (!await page.locator(".support-faq.open p").count()) throw new Error("Patient support FAQ did not expand");
  await page.locator(".support-category-label select").selectOption("technical");
  await page.locator(".support-contact textarea").fill("QA request for profile settings");
  await page.locator(".support-contact button[type=submit]").click();
  if (!await page.getByText("تم تسجيل الطلب في النموذج التجريبي.").count() || !await page.getByText("1 طلب").count()) throw new Error("Support request was not saved locally");
  await page.locator(".screen-title .back-button").click();

  await page.locator('.bottom-navigation button[data-nav-item="home"]').click();
  await page.locator(".section-heading .text-button").nth(1).click();
  if (!await page.getByText("كل الخدمات").count() || await page.locator(".service-card").count() < 30) throw new Error("Expanded personal-health service catalog did not open");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-e-nabiz-services-ar-1x.png") });
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = 520; });
  await page.waitForTimeout(220);
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-e-nabiz-services-mid-ar-1x.png") });
  await page.locator(".service-card").filter({ hasText: "مؤشراتي الصحية" }).click();
  if (!await page.getByText("إضافة ضغط الدم").count()) throw new Error("Health measurement actions were missing");
  await page.locator(".service-choice").filter({ hasText: "إضافة ضغط الدم" }).click();
  if (!await page.getByText("تم حفظ التغييرات").count()) throw new Error("Health measurement action did not produce a local confirmation");
  await page.locator(".notice-sheet .primary-button").click();
  await page.locator(".screen-title .back-button").click();
  await page.locator(".language-switch").click();
  if (await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("English service catalog must be LTR");
  await page.locator(".section-heading .text-button").nth(1).click();
  if (!await page.getByText("Health measurements").count() || !await page.getByText("Access history").count()) throw new Error("English health services were not translated");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-e-nabiz-services-en-1x.png") });
  await page.locator(".service-card").filter({ hasText: "Health measurements" }).click();
  if (!await page.getByText("Add blood pressure").count()) throw new Error("English health measurement actions were missing");
  await page.locator(".notice-sheet .sheet-close").click();
  await page.locator(".screen-title .back-button").click();
  await page.locator(".language-switch").click();
  await page.locator('.bottom-navigation button[data-nav-item="home"]').click();
  await page.locator(".language-switch").click();
  if (await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("English quick-service options must be LTR");
  await page.locator(".quick-item").nth(2).click();
  if (!await page.getByText("Find a medicine").count() || !await page.getByText("Upload a prescription").count() || !await page.getByText("Request pharmacy delivery").count()) throw new Error("English pharmacy quick action did not show its distinct choices");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-pharmacy-options-en-1x.png") });
  await page.locator(".notice-sheet .sheet-close").click();
  await page.locator(".quick-item").nth(3).click();
  if (!await page.getByText("Book a lab test").count() || !await page.getByText("Browse lab tests").count() || !await page.getByText("Upload a referral").count()) throw new Error("English lab quick action did not show its distinct choices");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-lab-options-en-1x.png") });
  await page.locator(".notice-sheet .sheet-close").click();
  await page.locator(".language-switch").click();

  await page.locator(".role-switch").click();
  await page.locator(".role-option").nth(1).click();
  if (!await page.getByText("مساحة الطبيب").count()) throw new Error("Doctor workspace did not open");
  await page.mouse.move(1, 1);
  await page.screenshot({ path: path.join(output, "mobile-doctor-ar.png") });
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-doctor-ar-1x.png") });
  await page.locator(".bottom-navigation button").nth(1).click();
  if (!await page.getByText("جدول اليوم").count()) throw new Error("Doctor schedule did not open");
  await page.locator(".bottom-navigation button").nth(3).click();
  await page.locator(".profile-photo-field input").setInputFiles(demoPhoto);
  await page.waitForFunction(() => document.querySelector(".profile-photo-field .profile-avatar img")?.getAttribute("src")?.startsWith("data:image/jpeg"));
  await page.locator(".profile-menu-item").nth(0).click();
  if (!await page.getByText("جدول اليوم").count()) throw new Error("Doctor profile appointment management did not open the schedule");
  await page.locator(".bottom-navigation button").nth(3).click();
  await page.locator(".profile-menu-item").nth(1).click();
  if (!await page.getByText("قائمة المرضى").count()) throw new Error("Doctor profile patient list did not open");
  await page.locator(".bottom-navigation button").nth(3).click();
  await page.locator(".profile-menu-item").nth(2).click();
  if (!await page.getByText("التخصصات والشهادات").count()) throw new Error("Doctor credentials page did not open");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-doctor-credentials-ar-1x.png") });
  await page.locator(".add-credential-form input").fill("طب القلب المتقدم");
  await page.locator(".add-credential-form button").click();
  if (!await page.getByText("طب القلب المتقدم").count()) throw new Error("Adding a doctor credential did not update the profile");
  await page.locator(".primary-button.full-button").click();
  await page.locator(".bottom-navigation button").nth(3).click();
  await page.locator(".profile-menu-item").nth(3).click();
  if (!await page.getByText("إعدادات مساحة الطبيب").count() || await page.locator('.toggle-switch[role="switch"]').count() !== 4) throw new Error("Doctor workspace settings did not open");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-doctor-settings-ar-1x.png") });
  const appointmentToggle = page.locator('.toggle-switch[role="switch"]').first();
  const previousToggleState = await appointmentToggle.getAttribute("aria-checked");
  await appointmentToggle.click();
  if (await appointmentToggle.getAttribute("aria-checked") === previousToggleState) throw new Error("Doctor availability setting did not toggle");
  await appointmentToggle.click();
  await page.locator(".bottom-navigation button").nth(3).click();
  await page.locator(".profile-menu-item").nth(4).click();
  if (!await page.getByText("الأسئلة الشائعة").count()) throw new Error("Doctor support center did not open");
  await page.locator(".support-faq").first().locator("button").click();
  if (!await page.locator(".support-faq.open p").count()) throw new Error("Support FAQ did not expand");
  await page.locator(".support-contact textarea").fill("أحتاج مساعدة في إعداد ملفي.");
  await page.locator(".support-contact button[type=submit]").click();
  if (!await page.getByText("تم تسجيل الطلب في النموذج التجريبي.").count()) throw new Error("Support request demo did not confirm submission");
  await resetPhoneScroll();
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-doctor-support-ar-1x.png") });
  await page.locator(".screen-title .back-button").click();
  await page.locator(".bottom-navigation button").first().click();
  await page.locator(".language-switch").click();
  if (await page.locator(".doctor-app").getAttribute("dir") !== "ltr") throw new Error("English doctor workspace must be LTR");
  await page.screenshot({ path: path.join(output, "mobile-doctor-en.png") });
  await page.locator(".language-switch").click();

  await page.locator(".role-switch").click();
  await page.locator(".role-option").nth(2).click();
  if (!await page.getByText("لوحة الإدارة").count()) throw new Error("Admin workspace did not open");
  await page.mouse.move(1, 1);
  await page.screenshot({ path: path.join(output, "mobile-admin-ar.png") });
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-admin-ar-1x.png") });
  await page.locator(".role-switch").click();
  await page.locator(".role-option").nth(0).click();

  await page.locator(".quick-item").nth(2).click();
  if (!await page.getByText("ابحث عن دواء").count()) throw new Error("Pharmacy actions did not match the selected service");
  await page.locator(".service-choice").first().click();
  await page.locator(".notice-sheet .primary-button").click();
  if (!await page.locator(".quick-grid").count() || !await page.getByText("كيف نقدر نساعدك اليوم؟").count()) throw new Error("Pharmacy selection did not return to the home screen");

  await page.locator(".quick-item").first().click();
  await page.locator(".book-mini").first().click();
  await page.locator(".booking-specialty").nth(1).click();
  await page.locator(".booking-doctor").first().click();
  await page.locator(".date-option").nth(2).click();
  await page.locator(".time-option").nth(4).click();
  await page.locator(".consultation-card").nth(1).click();
  if (await page.locator(".consultation-card").nth(1).getAttribute("aria-pressed") !== "true") throw new Error("Voice call appointment type was not selected");
  await page.locator(".consultation-card").nth(2).click();
  if (await page.locator(".consultation-card").nth(2).getAttribute("aria-pressed") !== "true") throw new Error("Video call appointment type was not selected");
  await page.locator(".primary-button.full-button").click();
  if (!await page.getByText("تم الحجز بنجاح").count()) throw new Error("Booking confirmation did not appear");
  if (!await page.getByText("مكالمة فيديو").count()) throw new Error("Video call type was missing from the booking confirmation");
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = 0; });
  await page.getByTestId("device-screen").evaluate((screen) => { screen.scrollTop = 0; });
  await page.waitForTimeout(280);
  await page.screenshot({ path: path.join(output, "mobile-booking-confirmation-ar.png") });
  await page.locator(".notice-sheet .primary-button").click();
  if (!await page.getByText("مواعيدي").count()) throw new Error("Booking flow did not return to appointments");
  if (!await page.getByText("مكالمة فيديو").count()) throw new Error("Booked call type was missing from appointment details");
  await page.locator(".appointment-contact-actions .message-doctor-action").click();
  if (!await page.getByText("محادثة الطبيب").count()) throw new Error("Arabic doctor chat did not open from the appointment");
  if (await page.locator(".chat-back").getAttribute("data-back-direction") !== "rtl") throw new Error("Arabic chat back arrow must point to the RTL start side");
  await page.getByTestId("device-screen").evaluate((screen) => { screen.scrollTop = 0; });
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = 0; });
  await page.locator(".chat-input").fill("شكراً دكتورة، سألتزم بالنصائح.");
  await page.locator(".send-message-button").click();
  if (!await page.getByText("شكراً دكتورة، سألتزم بالنصائح.").count()) throw new Error("Arabic chat did not send the message");
  await page.waitForTimeout(280);
  await page.screenshot({ path: path.join(output, "mobile-chat-ar.png") });
  await page.locator(".chat-back").click();
  await page.locator('.bottom-navigation button[data-nav-item="home"]').click();
  await page.locator(".quick-item").nth(1).click();
  if (await page.locator(".consultation-card").nth(2).getAttribute("aria-pressed") !== "true") throw new Error("Online consult shortcut did not open video booking");
  await page.locator(".consultation-card").nth(1).click();
  await page.locator(".primary-button.full-button").click();
  if (!await page.getByText("مكالمة صوتية").count()) throw new Error("Voice call booking confirmation did not appear");
  await page.locator(".notice-sheet .primary-button").click();
  await page.locator('.bottom-navigation button[data-nav-item="home"]').click();

  await page.locator('[data-testid="device-picker"]').click();
  await page.locator('[data-testid="device-option-pixel-10"]').click();
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = 0; });
  await page.getByTestId("device-screen").evaluate((screen) => { screen.scrollTop = 0; });
  await page.waitForTimeout(500);
  await assertNavigationFit("Pixel 10");
  if (await page.locator(".keyboard-dock").isVisible()) throw new Error("Closed keyboard graphic should be hidden on Pixel 10");
  const pixelScreen = await page.getByTestId("device-screen").boundingBox();
  const pixelHeader = await page.locator(".topbar").boundingBox();
  if (pixelScreen && pixelHeader && pixelHeader.y < pixelScreen.y - 1) throw new Error("Pixel 10 home content is scrolled above the screen");
  await page.screenshot({ path: path.join(output, "pixel-10-patient-ar.png") });
  const pixel = await page.locator('[data-testid="device-picker"]').getAttribute("aria-label");
  if (!pixel?.includes("Pixel 10")) throw new Error("Pixel 10 device selection failed");
  const pixelBox = await page.getByTestId("device-screen").boundingBox();
  if (!pixelBox || Math.abs(pixelBox.width - 427) > 1 || Math.abs(pixelBox.height - 952) > 1) throw new Error(`Expected a full-size Pixel screen at 427 x 952, got ${pixelBox?.width} x ${pixelBox?.height}`);
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "pixel-10-home-ar-1x.png") });
  if (!await page.locator('[data-testid="status-indicators"][data-platform="android"]').count()) throw new Error("Android status indicators are missing");
  if (!await page.getByTestId("android-navigation-bar").count()) throw new Error("Android navigation bar is missing");

  await page.locator('[data-testid="device-picker"]').click();
  await page.locator('[data-testid="device-option-iphone"]').click();
  await page.locator('.bottom-navigation button[data-nav-item="profile"]').click();
  await page.locator(".app-scroll .mobile-scroll").evaluate((scroll) => { scroll.scrollTop = scroll.scrollHeight; });
  await page.waitForTimeout(300);
  await page.locator(".signout-button").click();
  await page.getByTestId("device-screen").evaluate((screen) => { screen.scrollTop = 0; });
  if (!await page.getByText("مرحباً بعودتك").count() || !await page.locator(".auth-brand img").count()) throw new Error("Sign out did not return to the branded login screen");
  await page.locator(".auth-brand button").click();
  if (!await page.getByText("صحتك أقرب مما تتخيل").count()) throw new Error("Onboarding screen did not open");
  await page.waitForTimeout(500);
  if (await page.locator(".keyboard-dock").getAttribute("data-visible") !== "false") throw new Error("Keyboard remained open on the onboarding screen");
  if (await page.locator(".keyboard-dock").isVisible()) throw new Error("Keyboard graphic should be hidden on the onboarding screen");
  await page.mouse.move(1, 1);
  await page.getByTestId("device-screen").screenshot({ path: path.join(output, "iphone-onboarding-ar-1x.png") });
  await page.locator(".onboarding-dots button").nth(2).click();
  await page.locator(".primary-button.full-button").click();
  if (!await page.getByText("مرحباً بعودتك").count()) throw new Error("Login screen did not open");
  await page.locator('input[type="email"]').fill("sarah@example.com");
  await page.locator('input[type="password"]').fill("demo-password");
  await page.locator(".auth-submit").click();
  if (!await page.getByText("كيف نقدر نساعدك اليوم؟").count()) throw new Error("Local login flow did not return to the app");

  const brokenImages = await page.locator(".device-screen img").evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")));
  if (brokenImages.length) throw new Error(`Broken images: ${brokenImages.join(", ")}`);

  if (errors.length) throw new Error(`Browser console errors: ${errors.join(" | ")}`);
  console.log(`Visual QA passed. Screenshots saved to ${path.relative(root, output)}`);
} finally {
  await browser.close();
}
