const { Builder, By} = require('selenium-webdriver');
const { login } = require('./login'); 

require('chromedriver');

const USERNAME = '1267157';
const PASSWORD = '10df2f32286b7120Mi00LTc1MTc2MjE=30e0c83e6c29f1c3';

// helped IA
function parseDateDMY(text) {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) throw new Error(`No pude extraer la fecha de: ${text}`);
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function formatDateForInput(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDMY(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function addDays(baseDate, days) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d;
}

function substractDays(baseDate, days) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - days);
    return d;
}

function solveDateQuestion(text) {
  const daysMatch = text.match(/(\d+)\s+d[ií]as/i);
  if (!daysMatch) throw new Error(`No pude extraer cantidad de días de: ${text}`);

  const days = Number(daysMatch[1]);
  const baseDate = parseDateDMY(text);
  let result = null;
  if( text.includes("antes")){
     result = substractDays(baseDate, days);
  }

  if( text.includes("desde") && !text.includes("antes")){
     result = addDays(baseDate, days);  
  }
  

  return {
    inputDate: formatDateForInput(result),
    visibleDate: formatDateDMY(result),
  };
}

function isMultipleOf(number, multipleValue) {
  return number % multipleValue === 0;
}

// helped IA
function solveMathExpression(text) {
  const exprMatch = text.match(/([0-9+\-*/\s]+)/);
  if (!exprMatch) throw new Error(`No pude extraer la expresión de: ${text}`);

  const expr = exprMatch[1].replace(/\s+/g, '');
  if (!/^[0-9+\-*/]+$/.test(expr)) {
    throw new Error(`Expresión inválida: ${expr}`);
  }

  return Function(`return (${expr});`)();
}

async function solveDateCard(driver, text) {
  const dateInput = await driver.findElement(By.name('date'));
  const { inputDate,visibleDate } = solveDateQuestion(text);
  await dateInput.sendKeys(visibleDate);  
}

async function solveMultiplesOfCard(driver, labelText) {
  const checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));

  for (const checkbox of checkboxes) {
    const checkboxValue = await checkbox.getAttribute('value');
    
    const numMatch = labelText.match(/-?\d+/);
    if (!numMatch) continue;

    const multipleValue = Number(numMatch[0]);
    const shouldCheck = isMultipleOf(Number(checkboxValue), multipleValue);
    // const selected = await checkbox.isSelected();

    if (shouldCheck) await checkbox.click()
    // if (!shouldCheck && selected) await checkbox.click();
  }
}

async function solveMathCard(driver, labelText) {
  
  const result = solveMathExpression(labelText);

  const radioInputs = await driver.findElements(By.css('input[type="radio"]'));
  if (radioInputs.length > 0) {
    for (const radio of radioInputs) {
      const radioValue = +(await radio.getAttribute('value'));

      if( radioValue == result){
        await radio.click();
      }
    }
  }

  (await driver.findElement(By.name('select'))).sendKeys(String(result));
}

async function clickSubmit(driver) {
  const buttons = await driver.findElements(By.css('button, input[type="submit"]'));
  for (const btn of buttons) {
    const txt = (await btn.getText()).trim().toLowerCase();
    const type = (await btn.getAttribute('type')) || '';
    if (txt.includes('enviar') || txt.includes('submit') || type === 'submit') {
      await btn.click();
      return;
    }
  }
  throw new Error('No encontré botón Enviar');
}

async function hasErrorMessage(driver) {
  try {
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    return bodyText.toLowerCase().includes('ha cometido un error');
  } catch {
    return false;
  }
}

async function run() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await login(driver,USERNAME,PASSWORD);
    await driver.sleep(1000);
    
    for( let cycle = 0; cycle < 10; cycle++){
        const allLabels = (await driver.findElements(By.css('.text-center.text-xl'))).slice(2)
        for( let i = 0; i < allLabels.length; i++ ) {
        
            const text = await allLabels[i].getText();
            
            if( text.includes('Indique la fecha que corresponde')){
                await solveDateCard(driver, text);
            }
    
            if( text.includes('Selecciona todos los multiplos de')){
                await solveMultiplesOfCard(driver, text);
            }
    
            if( text.includes('Complete la siguiente operación matemática')){
                await solveMathCard(driver, await allLabels[i+1].getText());
            }
        }
    
        await clickSubmit(driver);
        await driver.sleep(1000);

        if( await hasErrorMessage(driver) ){
            cycle = 0;            
        }
    }
    

    

    // for (let attempt = 1; attempt <= 30; attempt++) {
    //   await driver.sleep(1000);

    //   const cards = await getQuestionCards(driver);
    //   if (cards.length === 0) {
    //     console.log('No encontré tarjetas de preguntas.');
    //     break;
    //   }

    //   for (const card of cards) {
    //     await solveCard(card);
    //   }

    //   await clickSubmit(driver);
    //   await driver.sleep(1200);

    //   const error = await hasErrorMessage(driver);
    //   if (error) {
    //     console.log('Hubo error, reiniciando desde login...');
    //     await login(driver);
    //     continue;
    //   }

    //   const bodyText = await driver.findElement(By.tagName('body')).getText();
    //   console.log('Ciclo procesado.');

    //   if (bodyText.toLowerCase().includes('hash')) {
    //     console.log('Parece que llegaste al resultado final.');
    //     console.log(bodyText);
    //     break;
    //   }
    // }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await driver.quit();
  }
}

run();