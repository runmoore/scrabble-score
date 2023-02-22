const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    colors: {
      green: {
        primary: '#0fa1a9',
        secondary: '#73cec6',
        ...colors.green,
      },
      slate: colors.slate,
      blue: {
        primary: '#054184',
        secondary: '#82a0c2',
        ...colors.blue,
      },
      red: {
        primary: '#d1435b',
        secondary: '#e18b96',
        ...colors.red,
      },
      white: colors.white,
      gray: colors.gray,
      yellow: {
        primary: '#ffb54d',
        secondary: '#ffebd0',
        ...colors.yellow,
      },
      purple: {
        primary: '#5a489b',
        secondary: '#a59bc8',
        ...colors.purple,
      },
    },
    extend: {},
  },
  plugins: [],
};
