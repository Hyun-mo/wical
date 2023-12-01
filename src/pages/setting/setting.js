// import { IpcRenderer } from "electron";
const IpcRenderer = require("electron").ipcRenderer;
const path = require("path");
// config: {
//   general: {
//     startingApp: false,
//     onlyCalendar: true,
//     resizable: true,
//     today_mark: true,
//   },
//   language: "ko",
// },
let config;
function init() {
  const General = document.getElementsByClassName("general")[0];
  document
    .getElementsByClassName("setting-done")[0]
    .addEventListener("click", (e) => {
      e.preventDefault();
      console.log(config);
      IpcRenderer.invoke("use-local-storage", { key: "config", value: config });
      IpcRenderer.invoke("goto", {
        URL: path.join(__dirname, "../main/main.html"),
        config: config,
      });
    });
  IpcRenderer.invoke("use-local-storage", { key: "config" }).then((result) => {
    console.log(result);
    config = result;
    console.log("renderer, handle");
    Object.entries(config["general"]).forEach(([key, value]) => {
      console.log(key, value);
      const p = document.createElement("p");
      const label = document.createElement("label");
      const input = document.createElement("input");
      p.setAttribute("class", "setting-check");
      label.setAttribute("class", "setting-label");
      input.type = "checkbox";
      input.checked = value;
      input.value = key;
      input.name = "g[]";
      input.id = key;
      label.innerText = key;
      label.setAttribute("for", key);
      input.onclick = (e) => {
        console.log(e.target.checked);
        config["general"][key] = e.target.checked;
      };
      p.appendChild(input);
      p.appendChild(label);
      General.appendChild(p);
    });
  });
}

init();
