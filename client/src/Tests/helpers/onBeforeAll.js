import puppeteer from "puppeteer";

export async function setBrowser() {
 // launch browser
 return await puppeteer.launch({
   headless: false, // headless mode set to false so browser opens up with visual feedback
   slowMo: 25, // how slow actions should be
 });
}

export default async function onBeforeAll() {
  let browser = await setBrowser();
  let page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080
  });

  return {
    browser,
    page,
  }
}