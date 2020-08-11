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

export const sortBy = (arr, key = false, ascOrDesc = 'asc') => {
  const multiplier = { asc: -1, desc: 1 }[ascOrDesc]
  if (!multiplier) throw new Error('3rd parameter must be "asc" or "desc"!')
  return [...arr].sort((a, b) =>
    (key ? a[key] : a) < (key ? b[key] : b) ? multiplier : multiplier * -1
  )
}

export function arraySwap(arr, from, to) {
  arr.splice(from, 1, arr.splice(to, 1, arr[from])[0])
}
