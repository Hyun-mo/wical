const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const google = require("./src/api/google");
const { parseData, readData, writeData } = require("./src/api/loaclStorage");

const isDev = process.env.NODE_ENV === "development";
let win;

async function createWindow(config) {
  win = new BrowserWindow({
    transparent: true,
    width: isDev ? 900 : 240,
    height: config.general.onlyCalendar ? 300 : 500,
    webPreferences: {
      // preload: path.join(__dirname, "src", "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
    titleBarStyle: "customButtonsOnHover",
    frame: false,
    resizable: false,
  });
  if (isDev) win.webContents.openDevTools();
  win.loadFile(path.join(__dirname, "src/pages/main/main.html"));
}

app.on("ready", () => {
  init();
  const config = readData("config");
  createWindow(config);
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

ipcMain.handle("goto", (_, { URL, config }) => {
  win.setSize(
    isDev ? 900 : 240,
    config?.general.onlyCalendar ? 300 : 500,
    true
  );
  win.loadFile(URL);
});

ipcMain.handle("use-config-storage", async (_, value) => {
  if (value) return writeData("config", value);
  return readData("config");
});

ipcMain.handle("use-calendar-storage", async (_, value) => {
  if (value) return writeData("calendar", value);
  return readData("calendar");
});

ipcMain.handle("google-get-calendar-event", async (_, { start, end }) => {
  const auth = await google.authorize();
  const calendar = readData("calendar");
  const active_calendar =
    Object.keys(calendar.activeCalendarList) ||
    (await google.calendarList(auth)).items;
  const result = await Promise.all(
    active_calendar
      .filter((key) => calendar.activeCalendarList[key])
      .map(async (id) => await google.synchronize(auth, start, end, id))
  );
  return event_to_hash([].concat(...result));
});

ipcMain.handle("google-get-calendar-list", async (_) => {
  const auth = await google.authorize();
  const data = await google.calendarList(auth);
  return data.items;
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

function init() {
  const calendar = readData("calendar");
  google
    .authorize()
    .then(google.calendarList)
    .then((calList) => {
      calendar.calendarList = calList.items;
      calList.items.forEach((item) => {
        if (!(item.id in calendar.activeCalendarList))
          calendar.activeCalendarList[item.id] = true;
      });
      Object.keys(calendar.activeCalendarList).forEach((id) => {
        if (!calList.items.find((item) => item.id === id))
          delete calendar.activeCalendarList[id];
      });
      writeData("calendar", calendar);
    });
}
