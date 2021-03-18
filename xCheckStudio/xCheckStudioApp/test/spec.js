const assert = require('assert');
const path = require('path');
const Application = require('spectron').Application;
const electronPath = require('electron');

const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, '..')],
});

describe('Application Launch', function () {
  this.timeout(10000);

  beforeEach(() => {
    return app.start();
  });

  after(() => {
    if (app && app.isRunning()) {
        return app.stop();
    }
});

  it('shows an initial window', async () => {
    const count = await app.client.getWindowCount();
    return assert.equal(count, 1);
  });
  
  it('Navigates to Enter', async () => {
    app.client.click('#ENTER');
    await app.client.waitUntilWindowLoaded();
    const crSettings = await app.client.getHTML('#CheckStudio');
    assert.ok(crSettings);
  });
  
});

