# 🚀 Prueba Qvision

Este proyecto contiene una solución automatizada para pruebas (QA Automation) desarrollada con **Node.js y Selenium WebDriver**.

---

## 📋 Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* Node.js (versión 16 o superior)
* npm (incluido con Node)
* Google Chrome
* ChromeDriver (compatible con tu versión de Chrome)

---

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/jesenia2596/PruebaQvision.git
cd PruebaQvision
```

2. Instala las dependencias:

```bash
npm install
```

---

## ⚙️ Configuración

### 🔧 ChromeDriver

Asegúrate de que **ChromeDriver** esté:

* Instalado en tu sistema, o
* Disponible en el PATH

Puedes verificarlo con:

```bash
chromedriver --version
```

---

## ▶️ Ejecución del Proyecto

Para ejecutar los scripts:

```bash
node nombre-del-archivo.js
```

Ejemplo:

```bash
node ejercicio1.js
node ejercicio2.js
```

---

## 🧪 Ejecución en modo debug

Si deseas ejecutar en modo debug (por ejemplo en VS Code):

1. Abre el proyecto en Visual Studio Code
2. Ve a la sección **Run and Debug**
3. Configura un archivo `launch.json` si no lo tienes:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Ejercicio 1",
      "program": "${workspaceFolder}/ejercicio1.js"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Ejercicio 2",
      "program": "${workspaceFolder}/ejercicio2.js"
    }
  ]
}
```

---

## 📂 Estructura del Proyecto

```
PruebaQvision/
│── ejercicio1.js
│── ejercicio2.js
│── package.json
│── node_modules/
```

---

## 🧠 Descripción

El proyecto automatiza tareas web utilizando Selenium, como:

* Login automático
* Lectura de información dinámica
* Resolución de ejercicios automatizados
* Interacción con elementos del DOM

---

## ⚠️ Problemas Comunes

### ❌ Error con ChromeDriver

* Verifica que la versión de ChromeDriver sea compatible con Chrome
* Descárgalo desde:
  👉 https://chromedriver.chromium.org/downloads

---

## 👩‍💻 Autor

* Yesenia
