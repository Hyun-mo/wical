const i18n_language_list = ["ko", "en", "ja"];
const i18n_month = {
  ko: Array.from({ length: 12 }, (_, i) => Number(i + 1) + "월"),
  en: [
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
  ],
  ja: Array.from({ length: 12 }, (_, i) => Number(i + 1) + "月"),
};

const i18n_days = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
};

module.exports = { i18n_language_list, i18n_month, i18n_days };
// export { i18n_language_list, i18n_month, i18n_days };
