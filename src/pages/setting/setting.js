// import { IpcRenderer } from "electron";
const IpcRenderer = require("electron").ipcRenderer;
const Theme = require("../../lib/theme");

let config;
let calendar;
function init() {
  // const app = document.getElementById("app");

  IpcRenderer.invoke("set-window-size", 480);
  document
    .getElementsByClassName("setting-done")[0]
    .addEventListener("click", (_) => {
      IpcRenderer.invoke("use-config-storage", config);
      IpcRenderer.invoke("use-calendarInfo-storage", calendar);
    });
  IpcRenderer.invoke("use-config-storage").then((result) => {
    config = result;
    Theme.apply(config.theme, config.opacity);
    // start up
    const start_up = document.getElementById("start_up");
    start_up.checked = config.start_up;
    start_up.onclick = (e) => {
      config.start_up = e.target.checked;
    };

    //opacity
    const opacity = document.getElementById("opacity");
    opacity.value = config.opacity * 100;
    opacity.onchange = (e) => {
      config.opacity = e.target.value / 100;
      Theme.apply(config.theme, config.opacity);
    };

    //language
    const language = document.getElementById("language");
    for (const e of language) {
      if (e.value === config.language) e.setAttribute("selected", "selected");
    }
    language.onchange = (e) => {
      config.language = e.target.value;
    };
    //theme
    const theme = document.getElementById("theme");
    for (const e of theme) {
      if (e.value === config.theme) e.setAttribute("selected", "selected");
    }
    theme.onchange = (e) => {
      config.theme = e.target.value;
      Theme.apply(config.theme, config.opacity);
    };
  });
  IpcRenderer.invoke("use-calendarInfo-storage").then((result) => {
    calendar = result;
    const p = document.getElementById("account");
    p.innerText = calendar.calendar_list.find((item) => item.primary).id;
    const CalendarList = document.getElementById("calendar-list");
    calendar.calendar_list.forEach((account) => {
      const p = document.createElement("p");
      const label = document.createElement("label");
      const input = document.createElement("input");
      p.setAttribute("class", "setting-check");
      label.setAttribute("class", "setting-label");
      input.type = "checkbox";
      input.checked = calendar.active_calendar[account.id];
      input.value = account.primary ? "primary" : account.summary;
      input.name = "g[]";
      input.id = account.id;
      label.innerText = account.primary
        ? "primary"
        : account.summaryOverride || account.summary;
      label.setAttribute("for", account.primary ? "primary" : account.summary);
      input.onclick = (e) => {
        calendar.active_calendar[account.id] = e.target.checked;
      };
      p.appendChild(input);
      p.appendChild(label);
      CalendarList.appendChild(p);
    });
  });
}
init();
