import puppeteer from 'puppeteer';
import { DEFAULT_SERVER } from "../consts";
import onBeforeAll from "./helpers/onBeforeAll";

let browser;
let page;

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
    let wargameTitle;
    const anchor = '#game-setup-head';
    const title = `Demo end to end ${Date.now()}`;
    const selectors = {
      createWargame: '.game-designer-action .link:nth-of-type(1)',
      wargameTitle: `${anchor} #title-editable`,
      saveWargame: `${anchor} .savewargame-icon`,
    };
    await page.waitFor(2500);
    await page.waitForSelector(selectors.createWargame);
    await page.click(selectors.createWargame);
    await page.waitForSelector(anchor);
    await page.waitForSelector(selectors.wargameTitle);
    await page.waitForFunction(selectors => document.querySelector(selectors.wargameTitle).value !== '', {}, selectors);
    await page.click(selectors.wargameTitle);
    await page.evaluate(selectors => document.querySelector(selectors.wargameTitle).value = '', selectors);
    await page.type(selectors.wargameTitle, title);
    await page.waitForSelector(selectors.saveWargame);
    await page.click(selectors.saveWargame);
    await page.waitForSelector('#notification');

    wargameTitle = await page.evaluate(selectors => document.querySelector(selectors.wargameTitle).value, selectors);
    expect(wargameTitle).toBe(title);
  }, 15000);

  test('Modify wargame overview description', async () => {
    let wargameDesc;
    const anchor = '#game-setup-tab-settings';
    const overview = 'Game overview example';
    const selectors = {
      gameDescription: '[name=wargame-overview-desc]',
      saveOverview: `${anchor} [data-qa-type=submit]`,
    };
    await page.waitFor(2500);
    await page.waitForSelector(selectors.gameDescription);
    await page.click(selectors.gameDescription);
    await page.type(selectors.gameDescription, overview);
    await page.waitForSelector(selectors.saveOverview);
    await page.click(selectors.saveOverview);
    await page.waitForSelector('#notification');

    wargameDesc = await page.evaluate(selectors => document.querySelector(selectors.gameDescription).value, selectors);
    expect(wargameDesc).toBe(overview);
  }, 15000);

  test('Enable access code', async () => {
    let accessCode;
    const anchor = '#game-setup-tab-settings';
    const selectors = {
      accessCode: '#show-access-codes',
      saveOverview: `${anchor} [data-qa-type=submit]`,
    };
    await page.waitFor(2500);
    await page.waitForSelector(selectors.accessCode);
    await page.click(selectors.accessCode);
    await page.waitForSelector(selectors.saveOverview);
    await page.click(selectors.saveOverview);
    await page.waitForSelector('#notification');

    accessCode = await page.evaluate(selectors => document.querySelector(selectors.accessCode).checked, selectors);
    expect(accessCode).toBeTruthy();
  }, 15000);

  test('Create forces', async () => {
    let forces;
    const anchor = '#game-setup-tab-forces';
    const selectors = {
      forceTab: '.tab-forces',
      addForce: `${anchor} [data-qa-type=add]`,
      saveForce: `${anchor} [data-qa-type=save]`,
      forceName: `${anchor} #editable-title`,
      listForces: `${anchor} .list-forces .list-title`,
    };
    const forceNames = ['Red Force', 'Blue Force', 'Yellow Force'];
    await page.waitForSelector(selectors.forceTab);
    await page.click(selectors.forceTab);
    await (async () => {
      for(let i = 0; i < forceNames.length; i++) {
        await page.waitFor(2500);
        await page.waitForSelector(selectors.addForce);
        await page.click(selectors.addForce);
        await page.waitForSelector(selectors.forceName);
        await page.waitForFunction(selectors => document.querySelector(selectors.forceName).value !== '', {}, selectors);
        await page.click(selectors.forceName);
        await page.evaluate(selectors => document.querySelector(selectors.forceName).value = '', selectors);
        await page.type(selectors.forceName, forceNames[i]);
        await page.waitForSelector(selectors.saveForce);
        await page.click(selectors.saveForce);
        await page.waitForSelector('#notification');
      }
    })();

    forces = await page.evaluate(selectors => document.querySelectorAll(selectors.listForces).length, selectors);
    expect(forces).toBe(forceNames.length + 1); // White force auto added
  }, 15000);

  test('Create channel', async () => {
    let channels;
    const anchors = {
      tab: '#game-setup-tab-channels',
      forceSelection: '#custom-select-force-selection',
      roleSelection: '#custom-select-role-selection',
      templateSelection: '#custom-select-template-selection',
    };
    const selectors = {
      channelTab: '.tab-channels',
      addChannel: `${anchors.tab} [data-qa-type=add]`,
      saveChannel: `${anchors.tab} [data-qa-type=save]`,
      channelName: `${anchors.tab} #editable-title`,
      channelForceToggle: `${anchors.forceSelection} .react-select__input`,
      channelForceMenu: `${anchors.forceSelection} .react-select__menu`,
      channelForceOptions: `${anchors.forceSelection} .react-select__option`,
      channelRoleToggle: `${anchors.roleSelection} .react-select__input`,
      channelRoleMenu: `${anchors.roleSelection} .react-select__menu`,
      channelRoleOptions: `${anchors.roleSelection} .react-select__option`,
      channelTemplateToggle: `${anchors.templateSelection} .react-select__input`,
      channelTemplateMenu: `${anchors.templateSelection} .react-select__menu`,
      channelTemplateOptions: `${anchors.templateSelection} .react-select__option`,
    };
    await page.waitForSelector(selectors.channelTab);
    await page.click(selectors.channelTab);
    await page.waitFor(2500);
    await page.waitForSelector(selectors.addChannel);
    await page.click(selectors.addChannel);
    await page.waitForSelector(selectors.channelName);
    await page.waitForFunction(selectors => document.querySelector(selectors.channelName).value !== '', {}, selectors);
    await page.click(selectors.channelName);
    await page.evaluate(selectors => document.querySelector(selectors.channelName).value = '', selectors);
    await page.type(selectors.channelName, 'Communication');
    await page.waitForSelector(selectors.saveChannel);
    await page.click(selectors.saveChannel);
    await page.waitForSelector('#notification');
    await page.waitForSelector(selectors.channelForceToggle);
    await page.click(selectors.channelForceToggle);
    await page.waitForSelector(selectors.channelForceMenu);
    await page.click(selectors.channelForceMenu);
    await page.waitForSelector(selectors.channelForceOptions);
    await page.evaluate(selectors => {
      document.querySelectorAll(selectors.channelForceOptions).find(option => option.innerText === 'White').click();
    }, selectors);
    await page.waitForSelector(selectors.channelRoleToggle);
    await page.click(selectors.channelRoleToggle);
    await page.waitForSelector(selectors.channelRoleMenu);
    await page.click(selectors.channelRoleMenu);
    await page.waitForSelector(selectors.channelRoleOptions);
    await page.evaluate(selectors => {
      document.querySelectorAll(selectors.channelRoleOptions).find(option => option.innerText === 'CO').click();
    }, selectors);
    await page.waitForSelector(selectors.channelTemplateToggle);
    await page.click(selectors.channelTemplateToggle);
    await page.waitForSelector(selectors.channelTemplateMenu);
    await page.click(selectors.channelTemplateMenu);
    await page.waitForSelector(selectors.channelTemplateOptions);
    await page.evaluate(selectors => {
      document.querySelectorAll(selectors.channelTemplateOptions).find(option => option.innerText === 'Chat').click();
    }, selectors);
  }, 15000);
});
