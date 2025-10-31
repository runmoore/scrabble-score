const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      green: {
        primary: "#0fa1a9",
        secondary: "#73cec6",
        ...colors.green,
      },
      blue: {
        primary: "#054184",
        secondary: "#82a0c2",
        ...colors.blue,
      },
      red: {
        primary: "#d1435b",
        secondary: "#e18b96",
        ...colors.red,
      },
      yellow: {
        primary: "#ffb54d",
        secondary: "#ffebd0",
        ...colors.yellow,
      },
      purple: {
        primary: "#5a489b",
        secondary: "#a59bc8",
        ...colors.purple,
      },
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      orange: colors.orange,
      amber: colors.amber,
      lime: colors.lime,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      indigo: colors.indigo,
      violet: colors.violet,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
    },
    extend: {},
  },
  plugins: [],
};
