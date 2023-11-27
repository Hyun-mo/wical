const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const google = require("./src/api/google");
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

ipcMain.handle("google-login", (_, data) => {
  console.log(data);
  return google.authorize();
});

ipcMain.handle("google-get-calendar", (_, { start, end }) => {
  console.log(start, end);
  return google
    .authorize()
    .then((auth) => google.listEvents(auth, start, end))
    .then(event_to_hash);
});

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {calendar_v3.Schema$Event[]} events
 * @returns {Object} hash object of calendar event
 */
function event_to_hash(events) {
  try {
    const result = {};
    events.forEach((v, i) => {
      const start = new Date(v.start.date || v.start.dateTime).getTime();
      const end = new Date(v.end.date || v.end.dateTime).getTime();
      let day = 1000 * 60 * 60 * 24;
      let t = 0;
      while (start + t < end) {
        if (Math.round((start + t) / day) in result)
          result[Math.round((start + t) / day)].push(v);
        else {
          result[Math.round((start + t) / day)] = [v];
        }
        t += day;
      }
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}
