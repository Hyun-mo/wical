const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const dataPath = app.getPath("userData");
const filePath = path.join(dataPath, "config.json");

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
      general: {
        startingApp: false,
        onlyCalendar: true,
        todayMark: true,
      },
      language: "ko",
    },
    calendar: {
      calendarList: [],
      activeCalendarList: {},
    },
  };
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    return data;
  } catch (error) {
    if (!fs.existsSync(filePath))
      fs.writeFileSync(filePath, JSON.stringify(defaultData));
    return defaultData;
  }
}

module.exports = { writeData, readData, parseData };
