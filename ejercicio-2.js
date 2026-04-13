const { Builder, By } = require("selenium-webdriver");
const { login } = require("./login");
require("chromedriver");

const MATRIX_COLUMNS = 12;
const MATRIX_ROW = 12;
const USERNAME = "1267157";
const PASSWORD = "10df2f32286b7120My0zLTc1MTc2MjE=30e0c83e6c29f1c3";

function testMappings(x, y, columns = 12) {
  const candidates = [
    { name: "center row=center-y col=center+x", row: 6 - y, col: 6 + x },
    { name: "center row=center+y col=center+x", row: 6 + y, col: 6 + x },
    { name: "center row=5-y col=5+x", row: 5 - y, col: 5 + x },
    { name: "center row=5+y col=5+x", row: 5 + y, col: 5 + x },
    { name: "topLeft row=y col=x", row: y, col: x },
    { name: "topRight row=y col=11-x", row: y, col: 11 - x },
    { name: "bottomLeft row=11-y col=x", row: 11 - y, col: x },
    { name: "bottomRight row=11-y col=11-x", row: 11 - y, col: 11 - x },
  ];

  return candidates.filter(
    (c) => c.row >= 0 && c.row < columns && c.col >= 0 && c.col < columns,
  );
}

function parseCoordinates(text) {
  const matches = text.match(/\((-?\d+),\s*(-?\d+)\)/g) || [];
  return matches.map((m) => {
    const [x, y] = m.match(/-?\d+/g).map(Number);
    return { x, y };
  });
}

function getIndexFromCoords(x, y, columns = 12) {
  const center = Math.floor(columns / 2); // 6
  const row = center - y;
  const col = center + x;

  if (row < 0 || col < 0 || row >= columns || col >= columns) {
    return null;
  }

  return row * columns + col;
}

// async function run() {
//   const driver = await new Builder().forBrowser('chrome').build();

//   try {
//     await driver.get(URL);
//     await driver.sleep(3000);

//     const bodyText = await driver.findElement(By.tagName('body')).getText();

//     const buttons = await driver.findElements(By.css('button'));

//     const numericButtons = [];

//     for (const btn of buttons) {
//       const text = (await btn.getText()).trim();
//       if (/^\d+$/.test(text)) {
//         numericButtons.push({
//           text: Number(text),
//           element: btn
//         });
//       }
//     }

//     const coords = parseCoordinates(bodyText);
//     console.log('coords:', coords);

//     for (const { x, y } of coords) {
//       const index = getIndexFromCoords(x, y, 12);

//       if (index !== null && numericButtons[index]) {
//         console.log(`CLICK (${x},${y}) -> ${numericButtons[index].text}`);

//         const el = numericButtons[index].element;

//         await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
//         await driver.sleep(500);
//         await driver.executeScript("arguments[0].click();", el);
//         await driver.sleep(800);

//       } else {
//         console.log('Índice inválido:', { x, y, index });
//       }
//     }

//   } catch (error) {
//     console.error(error);
//   }
// }

// run();

async function buildMatrix(driver) {
  let matrix = [];
  const buttons = await driver.findElements(By.name("button_option"));

  let column = 0;
  for (let row = 0; row < MATRIX_ROW; row++) {
    matrix[row] = [];
    for (let columnCount = 0; ; columnCount++) {
      matrix[row].push(await buttons[column].getText());
      column++;
      if (columnCount + 1 == MATRIX_COLUMNS) {
        break;
      }
    }
  }

  return matrix;
}

async function getCoordinates(driver) {
  const coordinatesUI = await driver.findElement(
    By.xpath("/html/body/div[2]/div[1]/p[2]"),
  );

  const text = await coordinatesUI.getText();

  const result = text
    .split("),") // separa cada coordenada
    .map((coord) => coord.replace(/[()]/g, "")) // quita ( y )
    .map((coord) => coord.split(",")) // separa x,y
    .map(([x, y]) => [Number(x), Number(y)]); // convierte a números

  return result;
}

function getValueFromMatrix(matrix, coordinates) {
  let row = 0;
  let col = 0;

  for (let [x, y] of coordinates) {
    row += y;
    col += x;
  }

  const targetRow = matrix[row];
  const sum = targetRow.reduce((acc, value) => Number(acc) + Number(value), 0);

  return {
    value: matrix[row][col],
    sum,
  };
}
async function run() {
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.manage().window().maximize();
  
  try {
    await login(driver, USERNAME, PASSWORD);
    await driver.sleep(1000);

    await driver.executeScript("document.body.style.zoom='50%'");
    for (let cycle = 0; cycle < 14; cycle++) {
      let coordinates = await getCoordinates(driver);
      let matrix = await buildMatrix(driver);

      const { value, sum } = getValueFromMatrix(matrix, coordinates);

      const buttonResult = await driver.findElement(By.css(`[value="${value}"]`));
      await buttonResult.click();

      await driver.sleep(1000);

      console.log(sum)
      const modalAnswer = await driver.findElement(By.name("modal_answer"));
      await modalAnswer.sendKeys(sum);

      const buttonSubmit = await driver.findElement(By.css('[type="submit"]'));
      await buttonSubmit.click();
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await driver.quit();
  }
}

run();
