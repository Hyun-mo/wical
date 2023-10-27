const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const dataPath = app.getPath("userData");
const filePath = path.join(dataPath, "config.json");

function createWindow() {
  const win = new BrowserWindow({
    transparent: true,
    width: 280,
    height: 500,
    webPreferences: {
      // preload: path.join(__dirname, "src", "preload.js"),
    },
    titleBarStyle: "customButtonsOnHover",
    frame: false,
  });

  // win.webContents.openDevTools();
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
  const defaultData = {};
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaultData;
  }
}
