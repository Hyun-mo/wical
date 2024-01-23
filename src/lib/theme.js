// const theme_list = ["dark", "light"];

const font = {
  dark: "#e3e3e3",
  light: "black",
};
const backgroud = {
  dark: (opacity) => `rgba(
    50,
    50,
    60,
    ${opacity}
  )`,
  light: (opacity) => `rgba(
    220,
    220,
    230,
    ${opacity}
  )`,
};
const blur_box = {
  dark: (opacity) => `rgba(
    ${210 - opacity * 140},
    ${210 - opacity * 140},
    ${220 - opacity * 140},
    ${opacity + 0.1}
  )`,
  light: (opacity) => `rgba(
    ${205 + opacity * 50},
    ${205 + opacity * 50},
    ${215 + opacity * 50},
    ${opacity + 0.1}
  )`,
};

function apply(theme, opacity) {
  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)")
      ? "dark"
      : "light";
  }
  const $body = document.getElementsByTagName("body")[0];
  $body.style.backgroundColor = backgroud[theme](opacity);
  $body.style.color = font[theme];
  for (const el of document.getElementsByTagName("select")) {
    el.style.backgroundColor = blur_box[theme](opacity);
  }
}
module.exports = { font, backgroud, blur_box, apply };
