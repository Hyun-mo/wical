const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const dataPath = app.getPath("userData");

function writeData(key, value) {
  const filePath = path.join(dataPath, key + ".json");
  fs.writeFileSync(filePath, JSON.stringify(value));
}

function readData(key) {
  let contents = parseData(key);
  return contents;
}

function parseData(key) {
  const filePath = path.join(dataPath, key + ".json");
  const defaultData = {
    config: {
      general: {
        startingApp: false,
        opacity: 1,
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
      if (key in defaultData)
        fs.writeFileSync(filePath, JSON.stringify(defaultData[key]));
      else fs.writeFileSync(filePath, "");
    return defaultData[key];
  }
}

module.exports = { writeData, readData, parseData };
