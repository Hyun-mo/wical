const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const dataPath = app.getPath("userData");
const filePath = path.join(dataPath, "config.json");
const isDev = process.env.NODE_ENV === "development";
parseData();
async function createWindow() {
  const config = readData("config");
  const win = new BrowserWindow({
    transparent: true,
    width: isDev ? 900 : 240,
    height: config.onlyCalc ? 300 : 500,
    webPreferences: {
      // preload: path.join(__dirname, "src", "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
    titleBarStyle: "customButtonsOnHover",
    frame: false,
  });

  if (isDev) win.webContents.openDevTools();
  win.loadFile(path.join(__dirname, "src", "pages", "main", "main.html"));
}

app.on("ready", () => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function writeData(key, value) {
  let contents = parseData();
  contents[key] = value;
  fs.writeFileSync(filePath, JSON.stringify(contents));
}

function readData(key) {
  let contents = parseData();
  return contents[key];
}

function parseData() {
  const defaultData = {
    config: {
      startingApp: false,
      onlyCalc: true,
      resizable: true,
    },
  };
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    if (!fs.existsSync(filePath))
      fs.writeFileSync(filePath, JSON.stringify(defaultData));
    return defaultData;
  }
}

ipcMain.handle("use-local-storage", (_, data) => {
  console.log(data["key"]);
  if ("value" in data) return writeData(data["key"], data["value"]);
  return readData(data["key"]);
});
