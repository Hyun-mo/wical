// import { IpcRenderer } from "electron";
const IpcRenderer = require("electron").ipcRenderer;
const path = require("path");
let config;
function init() {
  const General = document.getElementsByClassName("general")[0];
  document
    .getElementsByClassName("setting-done")[0]
    .addEventListener("click", (e) => {
      e.preventDefault();
      const body = document.getElementsByTagName("body");
      body[0].innerHTML = "";
      console.log(config);
      IpcRenderer.invoke("use-config-storage", config);
      IpcRenderer.invoke("goto", {
        URL: path.join(__dirname, "../main/main.html"),
        config: config,
      });
    });
  IpcRenderer.invoke("use-config-storage").then((result) => {
    console.log(result);
    config = result;
    Object.entries(config["general"]).forEach(([key, value]) => {
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
  IpcRenderer.invoke("use-calendar-storage").then((result) => {
    const calendar = result;
    const p = document.getElementById("account");
    p.innerText = calendar.calendarList.find((item) => item.primary).id;
    const CalendarList = document.getElementById("calendar-list");
    calendar.calendarList.forEach((account) => {
      const p = document.createElement("p");
      const label = document.createElement("label");
      const input = document.createElement("input");
      p.setAttribute("class", "setting-check");
      label.setAttribute("class", "setting-label");
      input.type = "checkbox";
      input.checked = calendar.activeCalendarList[account.id];
      input.value = account.primary ? "primary" : account.summary;
      input.name = "g[]";
      input.id = account.id;
      label.innerText = account.primary
        ? "primary"
        : account.summaryOverride || account.summary;
      label.setAttribute("for", account.primary ? "primary" : account.summary);
      input.onclick = (e) => {
        calendar.activeCalendarList[calendar.id] = e.target.checked;
      };
      p.appendChild(input);
      p.appendChild(label);
      CalendarList.appendChild(p);
    });
  });
}

init();
