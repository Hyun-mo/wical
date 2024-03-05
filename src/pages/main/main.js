const IpcRenderer = require("electron").ipcRenderer;
const { i18n_month, i18n_days, i18n_full_days } = require("../../lib/i18n");
const Theme = require("../../lib/theme");
const ONE_DAY = 1000 * 60 * 60 * 24;

let events = {};
let config;
let calendar;
function init() {
  // document.documentElement.style.fontSize = "18px";

  const app = document.getElementById("app");
  IpcRenderer.invoke("set-window-size", app.offsetHeight);
  let now_month = 0;
  getGoogleCalendar(new Date());
  const Arrow = document.getElementsByClassName("header")[0];
  Arrow.addEventListener("click", (e) => {
    if (e.target.classList.contains("left")) now_month -= 1;
    else if (e.target.classList.contains("right")) now_month += 1;
    else return;
    calRender(now_month, config.language);
    ShowNextSchedule();
  });

  const $pin = document.getElementById("pin");
  $pin.addEventListener("click", (e) => {
    config.alwaysOnTop = !config.alwaysOnTop;
    IpcRenderer.invoke("set-always-on-top", config.alwaysOnTop);
    if (config.alwaysOnTop) e.target.style.filter = "none";
    else e.target.style.filter = "invert(0.5)";
  });

  IpcRenderer.invoke("use-calendar-storage").then((result) => {
    calendar = result;
  });
  IpcRenderer.invoke("use-config-storage").then((result) => {
    config = result;
    calRender(0, config.language);
    Theme.apply(config.theme, config.opacity);
    if (config.alwaysOnTop) {
      $pin.style.filter = "none";
      IpcRenderer.invoke("set-always-on-top", config.alwaysOnTop);
    }
  });
}

function calRender(now_month, lang) {
  const now = new Date();
  const month = new Date();
  month.setDate(1);
  month.setMonth(month.getMonth() + now_month);
  const this_month = month.getMonth();
  const Month = document.getElementById("month");
  // Month.style.width = displayTextWidth(lang);
  Month.innerText = i18n_month[lang][month.getMonth()];
  const Calendar = document.getElementById("calendar");
  Calendar.innerHTML = "";
  for (const day of i18n_days[lang]) {
    const el = document.createElement("span");
    el.className = "day";
    el.innerText = day;
    Calendar.appendChild(el);
  }
  const date = new Date(month.getFullYear(), month.getMonth(), -month.getDay());
  for (let i = 0; i < 42; i++) {
    date.setDate(date.getDate() + 1);
    const mm = date.getMonth();
    const el = document.createElement("span");
    if (mm < this_month) {
      el.className = "date-prev";
    } else if (mm > this_month) {
      el.className = "date-next";
    } else if (date.getDate() === now.getDate() && now_month === 0) {
      el.classList.add("date-selected");
    }
    el.classList.add("date");
    el.innerText = date.getDate();
    if (!events) return;

    const dot_box = document.createElement("div");
    dot_box.className = "dot-box";
    const ev = events[Math.round(date.getTime() / ONE_DAY)];
    if (ev) {
      const max_account = 3;
      const accounts = [...new Set(ev.map((e) => e.creator.email))];
      accounts.slice(0, max_account).forEach((account) => {
        const color = calendar.calendar_list.find(
          (e) => e.id === account
        ).backgroundColor;
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.backgroundColor = color;
        dot_box.appendChild(dot);
      });
    }
    el.appendChild(dot_box);
    const this_date = date.getTime();
    el.addEventListener("click", (e) => {
      if (el.classList.contains("date-selected")) {
        el.classList.remove("date-selected");
        ShowNextSchedule();
      } else {
        const prev = document.getElementsByClassName("date-selected");
        if (prev.length) {
          prev[0].classList.remove("date-selected");
        }
        el.classList.add("date-selected");
        ShowNextSchedule(new Date(this_date));
      }
    });
    Calendar.appendChild(el);
  }

  let theme = config.theme;
  if (config.theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)")
      ? "dark"
      : "light";
  }
  document
    .getElementById("calendar")
    .querySelectorAll("span:nth-child(7n + 8), span:nth-child(7n + 14)")
    .forEach((v) => {
      v.style.backgroundColor = Theme.blur_box[theme](config.opacity);
    });
}

/**
 * get events of the year
 * @param{Date} month Date type
 */
function getGoogleCalendar(month) {
  const year = month.getFullYear();
  if (year in events) return;
  const start = new Date(month.getFullYear() - 1, 0, 1);
  const end = new Date(month.getFullYear() + 1, 0, 1);
  IpcRenderer.invoke("google-get-calendar-event", {
    start: start,
    end: end,
  }).then((result) => {
    events = result;
    calRender(0, config.language);
  });
}

/**
 * show 7days schedules from the date
 * @param {Date} date
 */
function ShowNextSchedule(date) {
  const Schedule = document.getElementById("schedule");
  Schedule.innerHTML = "";
  const days = Array.from({ length: 7 }, (_, i) => i);
  const event_set = new Set();
  if (date)
    days.map((i) => {
      const schedule = events[Math.round(date.getTime() / ONE_DAY)];
      date.setDate(date.getDate() + 1);
      if (!schedule) return;
      const event_list = schedule.filter((e) => !event_set.has(e.id));
      if (event_list.length) {
        const line = document.createElement("div");
        line.className = "division-line";
        Schedule.appendChild(line);
        const day = document.createElement("p");
        day.className = "text bold";
        day.innerText =
          i18n_full_days[config.language][(date.getDay() + 6) % 7];
        Schedule.appendChild(day);
        event_list.forEach((event) => {
          event_set.add(event.id);
          const p = document.createElement("p");
          const dot = document.createElement("span");
          const div = document.createElement("div");
          div.className = "schedule";
          dot.className = "dot dot-big";
          const color = calendar.calendar_list.find(
            (e) => e.id === event.creator.email
          ).backgroundColor;
          dot.style.backgroundColor = color;
          p.innerText = event.summary;
          const end = new Date(event.end.date || event.end.dateTime);
          const start = new Date(event.start.date || event.start.dateTime);
          if (event.end.date) end.setDate(end.getDate() - 1);
          if (
            Math.round(end.getTime() / ONE_DAY) !==
            Math.round(start.getTime() / ONE_DAY)
          ) {
            p.innerText +=
              "(" +
              "~" +
              Number(end.getMonth() + 1) +
              "." +
              end.getDate() +
              ")";
          }

          div.appendChild(dot);
          div.appendChild(p);
          Schedule.appendChild(div);
        });
      }
    });
  if (event_set.size) Schedule.style.display = "block";
  else Schedule.style.display = "none";
  const app = document.getElementById("app");
  IpcRenderer.invoke("set-window-size", app.offsetHeight + 5);
}

init();

// function displayTextWidth(lang) {
//   const month = document.getElementById("month");
//   const canvas =
//     displayTextWidth.canvas ||
//     (displayTextWidth.canvas = document.createElement("canvas"));
//   const context = canvas.getContext("2d");
//   const font = getComputedStyle(month).fontFamily.split(", ")[0];
//   context.font = `1.5rem ${font}`;

//   const metrics = i18n_month[lang].map((v) => context.measureText(v));
//   const max_width = Math.max(...metrics.map((v) => v.width));
//   console.log(metrics.map((v) => v.width));
//   return Math.ceil(max_width) + "px";
// }
