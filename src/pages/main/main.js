function init() {
  const today = new Date();
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
    Month.innerText = `${today.getMonth() + 1}` + "월";
  } else if (lang === "en") {
    Month.innerText = en_month[today.getMonth()];
  } else {
    Month.innerText = `${today.getMonth() + 1}` + "月";
  }
  const calendar = document.getElementById("calendar");
  for (const day of days[lang]) {
    const el = document.createElement("span");
    el.className = "day";
    el.innerText = day;
    calendar.appendChild(el);
  }
  const [prev, dates, next] = Board();
  console.log(prev);
  for (const date of prev) {
    const el = document.createElement("span");
    el.className = "date-prev date";
    el.innerText = date;
    calendar.appendChild(el);
  }
  for (const date of dates) {
    const el = document.createElement("span");
    el.className = "date";
    console.log(date);
    console.log(today.getDate());
    if (date === today.getDate()) el.className += " today";
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

function Board() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth());
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
  return [prev || [], dates, next];
}

init();
