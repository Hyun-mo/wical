const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { synchronize, calendarList } = require("./src/lib/google");
const { readData, writeData } = require("./src/lib/loaclStorage");

const appFolder = path.dirname(process.execPath);
const updateExe = path.resolve(appFolder, "..", "Update.exe");
const exeName = path.basename(process.execPath);
const isDev = process.env.NODE_ENV === "development";
let win;
const width = 260;

async function createWindow() {
  win = new BrowserWindow({
    transparent: true,
    width: width,
    height: 500,
    webPreferences: {
      // preload: path.join(__dirname, "src", "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: path.join(__dirname, "assets/icon.icon.png"),
    titleBarStyle: "customButtonsOnHover",
    frame: false,
    resizable: isDev,
    // alwaysOnTop: true,
  });
  if (isDev) win.webContents.openDevTools();
  win.loadFile(path.join(__dirname, "src/pages/main/main.html"));
}

app.on("ready", () => {
  init();
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

ipcMain.handle("goto", (_, { URL }) => {
  win.setSize(width, 300, true);
  win.loadFile(URL);
});

ipcMain.handle("set-window-size", (_, height) => {
  win.setSize(width, height);
});

ipcMain.handle("use-config-storage", async (_, value) => {
  if (value) return writeData("config", value);
  return readData("config");
});

ipcMain.handle("use-calendarInfo-storage", async (_, value) => {
  if (value) return writeData("calendarInfo", value);
  return readData("calendarInfo");
});

ipcMain.handle("google-get-calendar-event", async (_) => {
  const calendarInfo = readData("calendarInfo") || {};
  if (!("calendar_list" in calendarInfo)) return {};
  const active_calendar = Object.keys(calendarInfo.active_calendar || {});
  const result = await Promise.all(
    active_calendar
      .filter((key) => calendarInfo.active_calendar[key])
      .map(async (id) => await synchronize(id))
  );
  return event_to_hash([].concat(...result));
});

ipcMain.handle("google-get-calendar-list", async (_) => {
  const data = await calendarList();
  return data.items;
});

ipcMain.handle("set-always-on-top", (_, param) => {
  win.setAlwaysOnTop(param);
  const config = readData("config");
  config.alwaysOnTop = param;
  writeData("config", config);
});

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {calendar_v3.Schema$Event[]} events
 * @returns {Object} hash object of calendar event
 */
function event_to_hash(events) {
  const result = {};
  try {
    events.forEach((v, i) => {
      if (!v.start) return;
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
  } catch (err) {
    console.log(err);
  } finally {
    return result;
  }
}

async function init() {
  const calendarInfo = readData("calendarInfo");
  const calList = (await calendarList()).items;
  const config = readData("config");
  calendarInfo.calendar_list = calList;
  calList.forEach((item) => {
    synchronize(item.id);
    if (!(item.id in calendarInfo.active_calendar))
      calendarInfo.active_calendar[item.id] = true;
  });
  Object.keys(calendarInfo.active_calendar).forEach((id) => {
    if (!calList.find((item) => item.id === id))
      delete calendarInfo.active_calendar[id];
  });
  writeData("calendarInfo", calendarInfo);

  //launch at start
  app.setLoginItemSettings({
    openAtLogin: config.start_up,
    path: updateExe,
    args: [
      "--processStart",
      `"${exeName}"`,
      "--process-start-args",
      '"--hidden"',
    ],
  });
}
