import puppeteer from "puppeteer";
import { DEFAULT_SERVER } from "../consts";

let browser;
let page;
let networks = {};
let delays = {};
let wargameAttrs = {
  title: `Demo end to end ${Date.now()}`,
};
const umpireForce = {
  name: 'White',
  role: 'Game Control',
};
const customForces = [{
  name: 'Red Force',
  role: 'CO',
}, {
  name: 'Blue Force',
  role: 'CO',
}];
const allForces = [
  umpireForce,
  ...customForces,
];
const allChannels = [{
  name: 'Communication',
  template: 'Chat',
}, {
  name: 'Daily intentions',
  template: 'Daily intentions',
}];

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
  delays.preTest = async () => await page.waitFor(2500);
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
    await delays.preTest();
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
    await delays.preTest();
    await page.waitForSelector(selectors.createWargame);
    await page.evaluate(selectors => {
      [...document.querySelectorAll(selectors.createWargame)].find(btn => {
        return btn.innerText.match(/create/gi);
      }).click();
    }, selectors);
    await networks.updateWargame();
    await networks.getAllWargames();
  }, 15000);

  test('Modify wargame title', async () => {
    let title;
    const anchor = '#game-setup-head';
    const selectors = {
      wargameTitle: `${anchor} #title-editable`,
      saveWargame: `${anchor} .savewargame-icon`,
    };
    await delays.preTest();
    await page.waitForSelector(anchor);
    await page.waitForSelector(selectors.wargameTitle);
    await page.click(selectors.wargameTitle, {clickCount: 3});
    await page.type(selectors.wargameTitle, wargameAttrs.title);
    await page.waitForSelector(selectors.saveWargame);
    await page.click(selectors.saveWargame);
    await networks.updateWargame();
    await networks.fetchWargame();

    title = await page.$eval(selectors.wargameTitle, el => el.value);
    expect(title).toBe(wargameAttrs.title);
  }, 15000);

  test('Modify wargame overview description', async () => {
    let wargameDesc;
    const anchor = '#game-setup-tab-settings';
    const overview = 'Game overview example';
    const selectors = {
      gameDescription: '[name=wargame-overview-desc]',
      saveOverview: `${anchor} [data-qa-type=submit]`,
    };
    await delays.preTest();
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
    await delays.preTest();
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
    await delays.preTest();
    await page.waitForSelector(selectors.forceTab);
    await page.click(selectors.forceTab);
    await (async () => {
      for(let i = 0; i < customForces.length; i++) {
        await page.waitForSelector(selectors.addForce);
        await page.click(selectors.addForce);
        await networks.updateWargame();
        await networks.fetchWargame();
        await page.waitForSelector(selectors.forceName);
        await page.click(selectors.forceName, {clickCount: 3});
        await page.type(selectors.forceName, customForces[i].name);
        await page.waitForFunction(({selectors, forceName}) => {
          return document.querySelector(selectors.forceName).value === forceName;
        }, {}, { selectors, forceName: customForces[i].name});
        await page.waitForSelector(selectors.saveForce);
        await page.click(selectors.saveForce);
        await networks.updateWargame();
        await networks.fetchWargame();
      }
    })();

    forces = await page.$$eval(selectors.listForces, el => el.length);
    expect(forces).toBe(allForces.length); // White force auto added
  }, 25000);

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
    await delays.preTest();
    await page.waitForSelector(selectors.channelTab);
    await page.click(selectors.channelTab);
    await (async () => {
      for (let i = 0; i < allChannels.length; i++) {
        await page.waitForSelector(selectors.addChannel);
        await page.click(selectors.addChannel);
        await networks.updateWargame();
        await networks.fetchWargame();
        await page.waitForSelector(selectors.channelName);
        await page.click(selectors.channelName, {clickCount: 3});
        await page.type(selectors.channelName, allChannels[i].name);
        await page.waitForFunction(({selectors, channelName}) => {
          return document.querySelector(selectors.channelName).value === channelName;
        }, {}, {selectors, channelName: allChannels[i].name});
        await page.waitForSelector(selectors.saveChannel);
        await page.click(selectors.saveChannel);
        await networks.updateWargame();
        await networks.fetchWargame();
      }
    })();

    channels = await page.$$eval(selectors.listChannels, el => el.length);
    expect(channels).toBe(allChannels.length);
  }, 25000);

  test('Assign channel to force', async () => {
    let channels;
    const anchors = {
      tab: '#game-setup-tab-channels',
      forceSelection: '#custom-select-force-selection',
      roleSelection: '#custom-select-role-selection',
      templateSelection: '#custom-select-template-selection',
    };
    const selectors = {
      listChannels: `${anchors.tab} .list-channels .list-title`,
      channelName: `${anchors.tab} #editable-title`,
      saveChannel: `${anchors.tab} [data-qa-type=save]`,
      addParticipant: `${anchors.tab} [data-qa-type=add-participant]`,
      listParticipants: `${anchors.tab} .channel-participants-row`,
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
    await delays.preTest();
    await (async () => {
      for(let i = 0; i < allChannels.length; i++) {
        const channelName = allChannels[i].name;
        const channelTemplate = allChannels[i].template;
        await page.evaluate(({selectors, channelName}) => {
          [...document.querySelectorAll(selectors.listChannels)].find(list => {
            const label = new RegExp(`${channelName}`, 'gi');
            return list.innerText.match(label);
          }).click();
        }, {selectors, channelName});
        await page.waitForSelector(selectors.channelName);
        await page.waitForFunction(({selectors, channelName}) => {
          return document.querySelector(selectors.channelName).value === channelName;
        }, {}, {selectors, channelName});
        await (async () => {
          for(let j = 0; j < allForces.length; j++) {
            const forceName = allForces[j].name;
            const forceRole = allForces[j].role;
            await page.waitForSelector(selectors.channelForceToggle);
            await page.click(selectors.channelForceToggle);
            await page.waitForSelector(selectors.channelForceMenu);
            await page.waitForSelector(selectors.channelForceOptions);
            await page.waitForFunction(selectors => {
              return document.querySelectorAll(selectors.channelForceOptions).length > 0;
            }, {}, selectors);
            await page.evaluate(({selectors, forceName}) => {
              [...document.querySelectorAll(selectors.channelForceOptions)].find(option => {
                return option.innerText === forceName;
              }).click();
            }, {selectors, forceName});
            await page.waitForSelector(selectors.channelRoleToggle);
            await page.click(selectors.channelRoleToggle);
            await page.waitForSelector(selectors.channelRoleMenu);
            await page.waitForSelector(selectors.channelRoleOptions);
            await page.waitForFunction(selectors => {
              return document.querySelectorAll(selectors.channelRoleOptions).length > 0;
            }, {}, selectors);
            await page.evaluate(({selectors, forceRole}) => {
              [...document.querySelectorAll(selectors.channelRoleOptions)].find(option => {
                return option.innerText === forceRole;
              }).click();
            }, {selectors, forceRole});
            await page.waitForSelector(selectors.channelTemplateToggle);
            await page.click(selectors.channelTemplateToggle);
            await page.waitForSelector(selectors.channelTemplateMenu);
            await page.waitForSelector(selectors.channelTemplateOptions);
            await page.waitForFunction(selectors => {
              return document.querySelectorAll(selectors.channelTemplateOptions).length > 0;
            }, {}, selectors);
            await page.evaluate(({selectors, channelTemplate}) => {
              [...document.querySelectorAll(selectors.channelTemplateOptions)].find(option => {
                const label = new RegExp(`${channelTemplate}`, 'gi');
                return option.innerText.match(label);
              }).click();
            }, {selectors, channelTemplate});
            await page.waitForSelector(selectors.addParticipant);
            await page.click(selectors.addParticipant);
            await page.waitForSelector(selectors.listParticipants);
            await page.waitForFunction(({selectors, currentIndex}) => {
              return document.querySelectorAll(selectors.listParticipants).length === currentIndex;
            }, {}, {selectors, currentIndex: j+1});
          }
        })();
        await page.waitForSelector(selectors.saveChannel);
        await page.click(selectors.saveChannel);
        await networks.updateWargame();
        await networks.fetchWargame();
      }
    })();
  }, 25000);
});

describe('Demo umpire screen interface', () => {
  test('Initiate wargame', async () => {
    const anchors = {
      tab: '#demo-player-1',
      wargameSelection: '#custom-select-wargame-selection',
    };
    const selectors = {
      play: `${anchors.tab} button[name=play]`,
      enter: `${anchors.tab} button[name="enter-game"]`,
      initiate: `${anchors.tab} button[name="initiate-game"]`,
      selectWargameToggle: `${anchors.wargameSelection} .react-select__input`,
      selectWargameMenu: `${anchors.wargameSelection} .react-select__menu`,
      selectWargameOptions: `${anchors.wargameSelection} .react-select__option`,
      passwordButtons: `${anchors.tab} [data-qa-force-name="White"] .btn`,
    };
    await delays.preTest();
    await page.waitForSelector(anchors.tab);
    await page.waitForSelector(selectors.play);
    await page.click(selectors.play);
    await page.waitForSelector(selectors.selectWargameToggle);
    await page.click(selectors.selectWargameToggle);
    await page.waitForSelector(selectors.selectWargameMenu);
    await page.waitForSelector(selectors.selectWargameOptions);
    await page.waitForFunction(selectors => {
      return document.querySelectorAll(selectors.selectWargameOptions).length > 0;
    }, {}, selectors);
    await page.evaluate(({selectors, wargameTitle}) => {
      [...document.querySelectorAll(selectors.selectWargameOptions)].find(option => {
        const label = new RegExp(`${wargameTitle}`, 'gi');
        return option.innerText.match(label);
      }).click();
    }, {selectors, wargameTitle: wargameAttrs.title});
    await page.waitForSelector(selectors.passwordButtons);
    await page.evaluate(selectors => {
      [...document.querySelectorAll(selectors.passwordButtons)].find(btn => {
        return btn.innerText === 'Game Control';
      }).click();
    }, selectors);
    await page.waitForSelector(selectors.enter);
    await page.click(selectors.enter);
    await page.waitForSelector(selectors.initiate);
    await page.click(selectors.initiate);
  }, 15000);

  test('Complete wargame tour', async () => {
    let tour;
    const anchors = {
      tab: '#demo-player-1',
      tour: '#___reactour',
    };
    const selectors = {
      pages: `${anchors.tour} [data-tour-elem="dot"]`,
      close: `${anchors.tour} [data-qa-type="close-tour"]`
    };
    await delays.preTest();
    await page.waitForSelector(anchors.tour);
    await page.waitForSelector(selectors.pages);
    await page.evaluate(selectors => {
      const pages = [...document.querySelectorAll(selectors.pages)];
      for(let i = 1; i < pages.length; i++) {
        pages[i].click();
      }
    }, selectors);
    await page.waitForSelector(selectors.close);
    await page.click(selectors.close);
    tour = await page.$(anchors.tour);
    expect(tour).toBeNull();
  }, 15000);
});