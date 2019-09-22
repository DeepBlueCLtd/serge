import puppeteer from 'puppeteer';
import { DEFAULT_SERVER } from "../consts";
import onBeforeAll from "./helpers/onBeforeAll";

let browser;
let page;

let backspace = async (qty) => {
  for (let i=0 ; i<qty ; i++) {
    await page.keyboard.press('Backspace');
  }
};

beforeAll(async () => {
  // launch browser
  browser = await puppeteer.launch({
    headless: false, // headless mode set to false so browser opens up with visual feedback
    slowMo: 25, // how slow actions should be
  });

  page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080
  });
});

describe('Demo screen admin interface', () => {
  test('Login to game setup', async () => {
    const anchor = '#form-login-admin';
    let pageTitle;
    await page.goto('localhost:8080/serge/demo');
    await page.waitForSelector(`${anchor} [type=password]`);
    await page.type(`${anchor} [type=password]`, DEFAULT_SERVER); // cannot import consts file as import statements
    await page.click(`${anchor} .link`);
    await page.waitFor('#page-title');

    pageTitle = await page.evaluate(() => document.querySelector('#page-title').innerText);
    expect(pageTitle).toEqual('Games');
  }, 15000);

  test('Create wargame', async () => {
    let wargameName;
    await page.waitForSelector('.game-designer-action .link:nth-of-type(1)');
    await page.click('.game-designer-action .link:nth-of-type(1)');
    await page.waitFor('#game-setup-head');

    wargameName = await page.evaluate(() => document.querySelector('#game-setup-head').length);
    expect(wargameName).not.toBeNull();
  }, 15000);
});
