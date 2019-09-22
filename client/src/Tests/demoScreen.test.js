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
    let pageTitle;
    const anchor = '#form-login-admin';
    const selectors = {
      password: `${anchor} [type=password]`,
      submit: `${anchor} .link`,
    };
    await page.goto('localhost:8080/serge/demo');
    await page.waitForSelector(selectors.password);
    await page.click(selectors.password);
    await page.type(selectors.password, DEFAULT_SERVER);
    await page.click(selectors.submit);
    await page.waitForSelector('#page-title');

    pageTitle = await page.evaluate(() => document.querySelector('#page-title').innerText);
    expect(pageTitle).toEqual('Games');
  }, 15000);

  test('Create wargame', async () => {
    let wargameName;
    const selectors = {
      createWargame: '.game-designer-action .link:nth-of-type(1)',
    };
    await page.waitForSelector(selectors.createWargame);
    await page.click(selectors.createWargame);
    await page.waitForSelector('#game-setup-head');

    wargameName = await page.evaluate(() => document.querySelector('#game-setup-head').length);
    expect(wargameName).not.toBeNull();
  }, 15000);

  test('Modify wargame overview description', async () => {
    let wargameDesc;
    const anchor = '#game-setup-tab-settings';
    const selectors = {
      gameDescription: '[name=wargame-overview-desc]',
      saveOverview: `${anchor} [data-qa-type=submit]`,
    };
    await page.waitForSelector(selectors.gameDescription);
    await page.click(selectors.gameDescription);
    await page.type(selectors.gameDescription, 'Game overview example');
    await page.waitForSelector(selectors.saveOverview);
    await page.click(selectors.saveOverview);

    wargameDesc = await page.evaluate(selectors => document.querySelector(selectors.gameDescription).value, selectors);
    expect(wargameDesc).toBe('Game overview example');
  }, 15000);

  test('Enable access code', async () => {
    let accessCode;
    const anchor = '#game-setup-tab-settings';
    const selectors = {
      accessCode: '#show-access-codes',
      saveOverview: `${anchor} [data-qa-type=submit]`,
    };
    await page.waitForSelector(selectors.accessCode);
    await page.click(selectors.accessCode);
    await page.waitForSelector(selectors.saveOverview);
    await page.click(selectors.saveOverview);

    accessCode = await page.evaluate(selectors => document.querySelector(selectors.accessCode).checked, selectors);
    expect(accessCode).toBeTruthy();
  }, 15000);
});
