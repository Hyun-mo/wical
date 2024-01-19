const IpcRenderer = require("electron").ipcRenderer;
const { i18n_month, i18n_days, i18n_full_days } = require("../../../i18n");
const ONE_DAY = 1000 * 60 * 60 * 24;

let events = {};
let config;
let calendar;
function init() {
  const app = document.getElementById("app");
  IpcRenderer.invoke("set-window-size", app.offsetHeight);
  let now_month = 0;
  getGoogleCalendar(new Date());
  const Arrow = document.getElementsByClassName("head-line")[0];
  Arrow.addEventListener("click", (e) => {
    if (e.target.classList.contains("left")) now_month -= 1;
    else if (e.target.classList.contains("right")) now_month += 1;
    else return;
    calRender(now_month, config.language);
  });

  document.getElementById("calendar").addEventListener("click", (e) => {
    if (e.target.classList.contains("date")) {
      const prev = document.getElementsByClassName("selected");
      if (e.target.classList.contains("selected")) {
        e.target.classList.remove("selected");
        ShowNextSchedule();
      } else {
        if (prev.length) prev[0].classList.remove("selected");
        e.target.classList.add("selected");
        ShowNextSchedule(new Date(e.target.id));
      }
    }
  });
  const $pin = document.getElementById("pin");
  $pin.addEventListener("click", (e) => {
    console.log(e.target);
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
    console.log(config.opacity + 0.2);
    document.getElementsByTagName("body")[0].style.backgroundColor = `rgba(
      50,
      50,
      60,
      ${config.opacity}
    )`;
    console.log(config.alwaysOnTop);
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
      el.className = "date-prev date";
      el.innerText = date.getDate();
      el.id = date;
    } else if (mm === this_month) {
      el.className = "date";
      el.innerText = date.getDate();
      el.id = date;
      if (date.getDate() === now.getDate() && now_month === 0) {
        el.className = "date today";
      }
    } else {
      el.className = "date-next date";
      el.innerText = date.getDate();
      el.id = date;
    }
    if (!events) return;

    const ev = events[Math.round(date.getTime() / ONE_DAY)];
    if (ev) {
      const dot_box = document.createElement("div");
      dot_box.className = "dot-box";
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
        el.appendChild(dot_box);
      });
    }
    Calendar.appendChild(el);
  }
  document
    .getElementById("calendar")
    .querySelectorAll("span:nth-child(7n + 8), span:nth-child(7n + 14)")
    .forEach((v) => {
      v.style.backgroundColor = `rgba(
          ${210 - config.opacity * 140},
          ${210 - config.opacity * 140},
          ${220 - config.opacity * 140},
          ${config.opacity + 0.1}
        )`;
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
        day.className = "schedule-day";
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
  IpcRenderer.invoke("set-window-size", app.offsetHeight);
}

init();
