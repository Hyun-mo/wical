const IpcRenderer = require("electron").ipcRenderer;
const { i18n_month, i18n_days } = require("../../../i18n");
const path = require("path");
const ONE_DAY = 1000 * 60 * 60 * 24;

let events = {};
let config;
function init() {
  let now_month = 0;
  getGoogleCalendar(new Date());
  const Arrow = document.getElementsByClassName("head-line")[0];
  Arrow.addEventListener("click", (e) => {
    if (e.target.classList.contains("left")) now_month -= 1;
    else if (e.target.classList.contains("right")) now_month += 1;
    else return;
    calRender(now_month, config.language);
  });
  const Setting = document.getElementById("setting-btn");
  Setting.addEventListener("click", () => {
    IpcRenderer.invoke("goto", {
      URL: path.join(__dirname, "../setting/setting.html"),
      config: undefined,
    });
  });
  document.getElementById("calendar").addEventListener("click", (e) => {
    if (e.target.classList.contains("date")) {
      const prev = document.getElementsByClassName("selected");
      if (e.target.classList.contains("selected")) {
        e.target.classList.remove("selected");
        console.log(getSchedule(new Date()));
      } else {
        if (prev.length) prev[0].classList.remove("selected");
        e.target.classList.add("selected");
        console.log(getSchedule(new Date(e.target.id)));
        ShowNextSchedule(new Date(e.target.id));
      }
    }
  });
  IpcRenderer.invoke("use-local-storage", { key: "config" }).then((result) => {
    config = result;
    calRender(0, config.language);
    const NextSchedule = document.getElementsByClassName("next-schedule")[0];
    if (!config.general.onlyCalendar) NextSchedule.classList.remove("hidden");
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
  if (lang === "en") Month.style.width = "11rem";
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (const day of i18n_days[lang]) {
    const el = document.createElement("span");
    el.className = "day";
    el.innerText = day;
    calendar.appendChild(el);
  }

  const date = new Date(month.getFullYear(), month.getMonth(), -month.getDay());
  console.log("date");
  console.log(date);
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
      if (
        config.general.todayMark &&
        date.getDate() === now.getDate() &&
        now_month === 0
      ) {
        el.className = "date today";
      }
    } else {
      el.className = "date-next date";
      el.innerText = date.getDate();
      el.id = date;
    }
    if (events[Math.round(date.getTime() / ONE_DAY)]) {
      const e = events[Math.round(date.getTime() / ONE_DAY)];
      const dot_box = document.createElement("div");
      dot_box.className = "dot-box";
      for (asd of e) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot_box.appendChild(dot);
        el.appendChild(dot_box);
      }
    }
    calendar.appendChild(el);
  }
}

/**
 * get events of the year
 * @param{Date} month Date type
 */
function getGoogleCalendar(month) {
  const year = month.getFullYear();
  if (year in events) return;
  const start = new Date(month.getFullYear(), 0, 1);
  const end = new Date(month.getFullYear() + 1, 0, 0);
  console.log(start);
  console.log(end);
  IpcRenderer.invoke("google-get-calendar", {
    start: start,
    end: end,
  }).then((result) => {
    events = result;
    calRender(0, config.language);
    console.log(getSchedule(new Date()));
  });
}

function getSchedule(date) {
  // events[Math.round(date.getTime() / ONE_DAY)]
  const days = Array.from({ length: 7 }, (_, i) => i);
  console.log(date);
  return days.map((i) => {
    return events[Math.round(date.getTime() / ONE_DAY) + i];
  });
}
/**
 * show 7days schedules from the date
 * @param {Date} date
 */
function ShowNextSchedule(date) {
  if (config.general.onlyCalendar) return;
  const days = Array.from({ length: 7 }, (_, i) => i);
  const Schedule = document.getElementById("schedule");
  Schedule.innerHTML = "";
  days.map((i) => {
    const schedule = events[Math.round(date.getTime() / ONE_DAY) + i];
    schedule?.forEach((v) => {
      const p = document.createElement("p");
      p.innerText = v.summary;
      Schedule.appendChild(p);
    });
  });
}

init();
