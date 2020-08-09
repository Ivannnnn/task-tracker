const padZero = (val, n) =>
  val.toString().length > n ? val : ('0' + val).slice(n * -1)

export const startOfDay = (date) =>
  new Date(new Date(date).setHours(0, 0, 0, 0))

export const secsToTime = (secs) => {
  const mm = new Date(startOfDay(new Date()).getTime() + secs * 1000)
    .toString()
    .substr(19, 2)
  const hh = padZero(Math.floor(secs / 60 / 60), 2)
  const ss = padZero(secs % 60, 2)

  return [hh === '00' ? null : hh, mm, ss].filter(Boolean).join(':')
}

export function uuid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

export function keyBy(collection, key) {
  const result = {}
  collection.forEach((item) => {
    result[item[key]] = item
    delete item[key]
  })
  return result
}

export const classes = (...args) => {
  return args
    .map((arg) => {
      if (arg === null || arg === undefined) return null
      return typeof arg === 'string'
        ? arg
        : Object.keys(arg)
            .filter((key) => arg[key])
            .join(' ')
    })
    .filter(Boolean)
    .join(' ')
}
