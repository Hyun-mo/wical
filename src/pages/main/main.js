function init() {
  let now_month = 0;
  const btn = document.getElementsByClassName("arrow");
  for (const b of btn) {
    b.addEventListener("click", (e) => {
      if (b.classList.contains("left")) now_month -= 1;
      if (b.classList.contains("right")) now_month += 1;
      Board(now_month);
    });
  }

  Board(0);
  calendar.addEventListener("click", (e) => {
    console.log(e.target.innerText);
    if (e.target.classList.contains("date-prev")) {
      now_month -= 1;
      Board(now_month, Number(e.target.innerText));
    } else if (e.target.classList.contains("date-next")) {
      now_month += 1;
      Board(now_month, Number(e.target.innerText));
    } else if (e.target.classList.contains("date")) {
      Board(now_month, Number(e.target.innerText));
    }
  });
}

function Board(n, selected) {
  console.log(n, selected);
  const this_month = new Date();
  this_month.setDate(1);
  this_month.setMonth(this_month.getMonth() + n);
  const Month = document.getElementById("month");
  const lang = "ch";
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
    Month.innerText = `${this_month.getMonth() + 1}` + "월";
  } else if (lang === "en") {
    Month.innerText = en_month[this_month.getMonth()];
  } else {
    Month.innerText = `${this_month.getMonth() + 1}` + "月";
  }
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (const day of days[lang]) {
    const el = document.createElement("span");
    el.className = "day";
    el.innerText = day;
    calendar.appendChild(el);
  }
  const now = new Date();
  const first = new Date(this_month.getFullYear(), this_month.getMonth());
  const end = new Date(this_month.getFullYear(), this_month.getMonth() + 1, 0);
  let prev = [];
  let dates = [];
  let next = [];
  if (first.getDay() !== 0) {
    const last = new Date(first.getFullYear(), first.getMonth(), 0).getDate();
    for (let i = first.getDay(); i > 0; i--) {
      prev.push(last - i + 1);
    }
  }
  for (let i = 0; i < end.getDate(); i++) {
    dates.push(i + 1);
  }

  const next_days = 42 - dates.length - prev.length;
  for (let i = 0; next.length < next_days; i++) {
    next.push(i + 1);
  }

  for (const date of prev) {
    const el = document.createElement("span");
    el.className = "date-prev date";
    el.innerText = date;
    calendar.appendChild(el);
  }
  for (const date of dates) {
    const el = document.createElement("span");
    el.className = "date";
    if (date === selected) el.className = "date selected";
    if (n === 0 && date === now.getDate()) el.className = "date today";
    el.innerText = date;
    calendar.appendChild(el);
  }
  for (const date of next) {
    const el = document.createElement("span");
    el.className = "date-next date";
    el.innerText = date;
    calendar.appendChild(el);
  }
}

init();
