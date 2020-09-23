module.exports = {
  purge: ['./public/index.html', './src/**/*.jsx', './src/**/*.js'],
  theme: {},

  variants: {
    cursor: ({ after }) => after(['focus']),
  },
}
