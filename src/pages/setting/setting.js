// import { IpcRenderer } from "electron";
const IpcRenderer = require("electron").ipcRenderer;
console.log("renderer, settings");

function init() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth());
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  IpcRenderer.invoke("use-local-storage", { key: "config" }).then((result) => {
    console.log(result);
    console.log("renderer, handle");
  });
  IpcRenderer.invoke("google-get-events", {
    start: first,
    end: end,
  }).then((result) => {
    console.log(result);
  });
}

init();
