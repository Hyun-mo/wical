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
    const Account = document.getElementById("account");
    Account.className = "head-line";
    const p = document.createElement("p");
    p.innerText = config.calendarList.find((item) => item.primary).id;
    Account.append(p);
    const CalendarList = document.getElementById("calendar-list");
    config.calendarList.forEach((calendar) => {
      const p = document.createElement("p");
      const label = document.createElement("label");
      const input = document.createElement("input");
      p.setAttribute("class", "setting-check");
      label.setAttribute("class", "setting-label");
      input.type = "checkbox";
      input.checked = config.activeCalendarList[calendar.id];
      input.value = calendar.primary ? "primary" : calendar.summary;
      input.name = "g[]";
      input.id = calendar.id;
      label.innerText = calendar.primary
        ? "primary"
        : calendar.summaryOverride || calendar.summary;
      label.setAttribute(
        "for",
        calendar.primary ? "primary" : calendar.summary
      );
      input.onclick = (e) => {
        config.activeCalendarList[calendar.id] = e.target.checked;
      };
      p.appendChild(input);
      p.appendChild(label);
      CalendarList.appendChild(p);
    });
  });
  // IpcRenderer.invoke("google-get-calendar-list").then(console.log);
}

init();
