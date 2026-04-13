const { By } = require("selenium-webdriver");
const { until } = require("selenium-webdriver");

const URL = 'https://tasks.evalartapp.com/automatization/';

async function login(driver, username, password) {
  await driver.get(URL);

  await driver.wait(until.elementLocated(By.css('input[name="username"], input[type="text"]')), 10000);

  const userInput = await driver.findElement(By.css('input[name="username"], input[type="text"]'));
  const passInput = await driver.findElement(By.css('input[name="password"], input[type="password"]'));

  await userInput.clear();
  await userInput.sendKeys(username);

  await passInput.clear();
  await passInput.sendKeys(password);

  const buttons = await driver.findElements(By.css('button, input[type="submit"]'));
  for (const btn of buttons) {
    const txt = (await btn.getText()).trim().toLowerCase();
    const type = (await btn.getAttribute('type')) || '';
    if (txt.includes('login') || txt.includes('iniciar') || type === 'submit') {
      await btn.click();
      return;
    }
  }

  throw new Error('No encontré el botón de login');
}

module.exports = {login};