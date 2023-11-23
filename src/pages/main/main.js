const IpcRenderer = require("electron").ipcRenderer;
let events = {};
const lang = "ko";
function init() {
  getGoogleCalendar(new Date());
  let now_month = 0;
  const arrow = document.getElementsByClassName("head-line")[0];
  arrow.addEventListener("click", (e) => {
    if (e.target.classList.contains("left")) now_month -= 1;
    if (e.target.classList.contains("right")) now_month += 1;
    calRender(now_month, lang);
  });
  calRender(0, lang);

  document.getElementById("calendar").addEventListener("click", (e) => {
    if (e.target.classList.contains("date-prev")) {
      now_month -= 1;
      calRender(now_month, lang);
    } else if (e.target.classList.contains("date-next")) {
      now_month += 1;
      calRender(now_month, lang);
    } else if (e.target.classList.contains("date")) {
      const prev = document.getElementsByClassName("selected");
      if (e.target.classList.contains("selected")) {
        e.target.classList.remove("selected");
      } else {
        if (prev.length) prev[0].classList.remove("selected");
        e.target.classList.add("selected");
      }
    }
  });
  IpcRenderer.invoke("use-local-storage", { key: "config" }).then((result) => {
    console.log(result);
    console.log("renderer, handle");
  });
}

function calRender(now_month, lang) {
  const now = new Date();
  const month = new Date();
  month.setDate(1);
  month.setMonth(month.getMonth() + now_month);
  const this_month = month.getMonth();
  const Month = document.getElementById("month");
  const days = {
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ch: ["日", "月", "火", "水", "木", "金", "土"],
  };
  const en_month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "Octorber",
    "November",
    "December",
  ];
  if (lang === "ko") {
    Month.innerText = `${month.getMonth() + 1}` + "월";
  } else if (lang === "en") {
    Month.style.width = "11rem";
    Month.innerText = en_month[month.getMonth()];
  } else {
    Month.innerText = `${month.getMonth() + 1}` + "月";
  }
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (const day of days[lang]) {
    const el = document.createElement("span");
    el.className = "day";
    el.innerText = day;
    calendar.appendChild(el);
  }

  const date = new Date(month.getFullYear(), month.getMonth(), -month.getDay());
  const day = 1000 * 60 * 60 * 24;
  console.log(date);
  console.log(events);
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

      if (date === now.getDate() && now_month === 0) {
        el.className = "date today";
      }
    } else {
      el.className = "date-next date";
      el.innerText = date.getDate();
      el.id = date;
    }
    if (events[Math.round(date.getTime() / day)]) {
      const e = events[Math.round(date.getTime() / day)];
      console.log(date);
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
    calRender(0, lang);
  });
}

init();
