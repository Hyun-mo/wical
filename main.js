const { app, BrowserWindow } = require("electron");
const path = require("path");
function createWindow() {
  const win = new BrowserWindow({
    width: 280,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "src", "preload.js"),
    },
    frame: false,
  });

  win.loadFile(path.join(__dirname, "src", "pages", "main", "index.html"));
}

app.whenReady().then(() => {
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
