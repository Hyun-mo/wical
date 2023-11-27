// import { IpcRenderer } from "electron";
const IpcRenderer = require("electron").ipcRenderer;
function init() {
  IpcRenderer.invoke("use-local-storage", { key: "config" }).then((result) => {
    console.log(result);
    console.log("renderer, handle");
  });
}

init();
