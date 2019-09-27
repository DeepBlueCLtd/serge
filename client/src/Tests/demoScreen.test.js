import puppeteer from "puppeteer";
import { DEFAULT_SERVER } from "../consts";

let browser;
let page;
let networks = {};
const forceNames = ['Red Force', 'Blue Force', 'Yellow Force'];
const channelNames = ['Communications', 'Weather', 'Daily Intentions'];

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 25,
  });
  page = await browser.newPage();
  networks.updateWargame = async () => {
    await page.waitForResponse(response => {
      const request = response.request();
      return request.url().endsWith('_local/settings') && request.method() === 'PUT' && response.status() === 201
    });
  };
  networks.fetchWargame = async () => {
    await page.waitForResponse(response => {
      const request = response.request();
      return request.url().endsWith('_local/settings?') && request.method() === 'GET' && response.status() === 200
    });
  };
  networks.getAllWargames = async () => {
    await page.waitForResponse(response => {
      const request = response.request();
      return request.url().endsWith('_all_docs?descending=true&include_docs=true') && request.method() === 'GET' && response.status() === 200
    });
  };
});

describe('Demo screen admin interface', () => {
  test('Open demo page', async () => {
    await page.setViewport({
      width: 1920,
      height: 1080
    });
    await page.goto('localhost:8080/serge/demo');
  }, 15000);

  test('Login to game setup', async () => {
    let pageTitle;
    const anchor = '#form-login-admin';
    const selectors = {
      password: `${anchor} [type=password]`,
      submit: `${anchor} .link`,
      pageTitle: '#page-title',
    };
    await page.waitFor(2500);
    await page.waitForSelector(selectors.password);
    await page.click(selectors.password);
    await page.type(selectors.password, DEFAULT_SERVER);
    await page.click(selectors.submit);
    await page.waitForSelector(selectors.pageTitle);

    pageTitle = await page.$eval(selectors.pageTitle, el => el.innerText);
    expect(pageTitle).toEqual('Games');
  }, 15000);

  test('Create wargame', async () => {
    const selectors = {
      createWargame: '.game-designer-action .link',
    };
    await page.waitFor(2500);
    await page.waitForSelector(selectors.createWargame);
    await page.evaluate(selectors => {
      [...document.querySelectorAll(selectors.createWargame)].find(btn => btn.innerText.toLowerCase().match(/create/)).click();
    }, selectors);
    await networks.updateWargame();
    await networks.getAllWargames();
  }, 15000);

  test('Modify wargame title', async () => {
    let wargameTitle;
    const anchor = '#game-setup-head';
    const title = `Demo end to end ${Date.now()}`;
    const selectors = {
      wargameTitle: `${anchor} #title-editable`,
      saveWargame: `${anchor} .savewargame-icon`,
    };
    await page.waitFor(2500);
    await page.waitForSelector(anchor);
    await page.waitForSelector(selectors.wargameTitle);
    await page.evaluate(selectors => document.querySelector(selectors.wargameTitle).click(), selectors);
    await page.evaluate(selectors => document.querySelector(selectors.wargameTitle).value = '', selectors);
    await page.type(selectors.wargameTitle, title);
    await page.waitForSelector(selectors.saveWargame);
    await page.click(selectors.saveWargame);
    await networks.updateWargame();

    wargameTitle = await page.$eval(selectors.wargameTitle, el => el.value);
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
    await networks.updateWargame();

    wargameDesc = await page.$eval(selectors.gameDescription, el => el.value);
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
    await networks.updateWargame();

    accessCode = await page.$eval(selectors.accessCode, el => el.checked);
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
    await page.waitForSelector(selectors.forceTab);
    await page.click(selectors.forceTab);
    await (async () => {
      for(let i = 0; i < forceNames.length; i++) {
        await page.waitForSelector(selectors.addForce);
        await page.click(selectors.addForce);
        await networks.updateWargame();
        await networks.fetchWargame();
        await page.waitForSelector(selectors.forceName);
        await page.evaluate(selectors => document.querySelector(selectors.forceName).click(), selectors);
        await page.evaluate(selectors => document.querySelector(selectors.forceName).value = '', selectors);
        await page.type(selectors.forceName, forceNames[i]);
        await page.waitForFunction(({selectors, forceName}) => {
          return document.querySelector(selectors.forceName).value === forceName;
        }, {}, { selectors, forceName: forceNames[i]});
        await page.waitForSelector(selectors.saveForce);
        await page.click(selectors.saveForce);
        await networks.updateWargame();
      }
    })();

    forces = await page.$$eval(selectors.listForces, el => el.length);
    expect(forces).toBe(forceNames.length + 1); // White force auto added
  }, 15000);

  test('Create channels', async () => {
    let channels;
    const anchor = '#game-setup-tab-channels';
    const selectors = {
      channelTab: '.tab-channels',
      addChannel: `${anchor} [data-qa-type=add]`,
      saveChannel: `${anchor} [data-qa-type=save]`,
      channelName: `${anchor} #editable-title`,
      listChannels: `${anchor} .list-channels .list-title`,
    };
    await page.waitForSelector(selectors.channelTab);
    await page.click(selectors.channelTab);
    await (async () => {
      for (let i = 0; i < channelNames.length; i++) {
        await page.waitForSelector(selectors.addChannel);
        await page.click(selectors.addChannel);
        await networks.updateWargame();
        await networks.fetchWargame();
        await page.waitForSelector(selectors.channelName);
        await page.evaluate(selectors => document.querySelector(selectors.channelName).click(), selectors);
        await page.evaluate(selectors => document.querySelector(selectors.channelName).value = '', selectors);
        await page.type(selectors.channelName, channelNames[i]);
        await page.waitForFunction(({selectors, channelName}) => {
          return document.querySelector(selectors.channelName).value === channelName;
        }, {}, {selectors, channelName: channelNames[i]});
        await page.waitForSelector(selectors.saveChannel);
        await page.click(selectors.saveChannel);
        await networks.updateWargame();
      }
    });

    channels = await page.$$eval(selectors.listChannels, el => el.length);
    expect(channels).toBe(channelNames.length);
  }, 15000);

  // test('Assign channel to force', async () => {
  //   let channels;
  //   const anchors = {
  //     tab: '#game-setup-tab-channels',
  //     forceSelection: '#custom-select-force-selection',
  //     roleSelection: '#custom-select-role-selection',
  //     templateSelection: '#custom-select-template-selection',
  //   };
  //   const selectors = {
  //     channelTab: '.tab-channels',
  //     saveChannel: `${anchors.tab} [data-qa-type=save]`,
  //     addParticipant: `${anchors.tab} [data-qa-type=add-participant]`,
  //     channelForceToggle: `${anchors.forceSelection} .react-select__input`,
  //     channelForceMenu: `${anchors.forceSelection} .react-select__menu`,
  //     channelForceOptions: `${anchors.forceSelection} .react-select__option`,
  //     channelRoleToggle: `${anchors.roleSelection} .react-select__input`,
  //     channelRoleMenu: `${anchors.roleSelection} .react-select__menu`,
  //     channelRoleOptions: `${anchors.roleSelection} .react-select__option`,
  //     channelTemplateToggle: `${anchors.templateSelection} .react-select__input`,
  //     channelTemplateMenu: `${anchors.templateSelection} .react-select__menu`,
  //     channelTemplateOptions: `${anchors.templateSelection} .react-select__option`,
  //   };
  //   await page.waitFor(2500);
  //   await page.waitForSelector(selectors.channelForceToggle);
  //   await page.click(selectors.channelForceToggle);
  //   await page.waitForSelector(selectors.channelForceMenu);
  //   await page.waitForSelector(selectors.channelForceOptions);
  //   await page.evaluate(selectors => {
  //     [...document.querySelectorAll(selectors.channelForceOptions)].find(option => option.innerText === 'White').click();
  //   }, selectors);
  //   await page.waitForSelector(selectors.channelRoleToggle);
  //   await page.click(selectors.channelRoleToggle);
  //   await page.waitForSelector(selectors.channelRoleMenu);
  //   await page.waitForSelector(selectors.channelRoleOptions);
  //   await page.evaluate(selectors => {
  //     [...document.querySelectorAll(selectors.channelRoleOptions)].find(option => option.innerText === 'Game Control').click();
  //   }, selectors);
  //   await page.waitForSelector(selectors.channelTemplateToggle);
  //   await page.click(selectors.channelTemplateToggle);
  //   await page.waitForSelector(selectors.channelTemplateMenu);
  //   await page.waitForSelector(selectors.channelTemplateOptions);
  //   await page.evaluate(selectors => {
  //     [...document.querySelectorAll(selectors.channelTemplateOptions)].find(option => option.innerText === 'Chat').click();
  //   }, selectors);
  //   await page.waitForSelector(selectors.addParticipant);
  //   await page.click(selectors.addParticipant);
  //   await page.waitForSelector(selectors.saveChannel);
  //   await page.click(selectors.saveChannel);
  //   await page.waitForSelector('#notification');
  // }, 15000);
});
