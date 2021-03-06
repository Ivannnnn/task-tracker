export const padZero = (val, n) =>
  val.toString().length > n ? val : ('0' + val).slice(n * -1)

export const startOfDay = (date) =>
  new Date(new Date(date).setHours(0, 0, 0, 0))

export const secsToTime = (secs) => {
  const mm = new Date(startOfDay(new Date()).getTime() + secs * 1000)
    .toString()
    .substr(19, 2)
  const hh = padZero(Math.floor(secs / 60 / 60), 2)

  return [hh, mm].join(':')
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

const sortStrategies = {
  asc: (a, b) => (a - b > 0 ? 1 : -1),
  desc: (a, b) => (a - b < 0 ? 1 : -1),
}

export const sortByKey = (obj, ascOrDesc) => {
  return Object.keys(obj)
    .sort((a, b) => sortStrategies[ascOrDesc](a, b))
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {})
}

export const sortBy = (arr, key = false, ascOrDesc = 'asc') => {
  return [...arr].sort((a, b) =>
    sortStrategies[ascOrDesc](key ? a[key] : a, key ? b[key] : b)
  )
}

export function arraySwap(arr, from, to) {
  arr.splice(from, 1, arr.splice(to, 1, arr[from])[0])
}

const createIndex = (arr, key) => {
  const index = {}
  arr.forEach((item, i) => {
    index[item[key]] = index[item[key]] ? [...index[item[key]], i] : [i]
  })
  return index
}

export const relate = (data, relations) => {
  const toArray = (d) => (d.constructor === Array ? d : Object.values(d))

  relations.forEach((relation) => {
    relation = relation.replace(/ +?/g, '').split('->')
    const [
      [parentName, parentKey],
      [childName, childKey],
    ] = relation.map((item) => item.split('.'))

    const parentData = toArray(data[parentName])
    const childData = toArray(data[childName])

    const childByParentKey = createIndex(childData, childKey)

    parentData.forEach((parent, i) => {
      parent[childName] = (childByParentKey[parent[parentKey]] || []).map(
        (childIndex) => childData[childIndex].id
      )
    })
  })
}

export const pick = (props, keys) =>
  keys.reduce((acc, key) => {
    return { ...acc, [key]: props[key] }
  }, {})

export const pluck = (arr, prop) => {
  if (arr.constructor !== Array) arr = Object.values(arr)
  return arr.map((obj) => obj[prop])
}

export const intersect = (array1, array2) =>
  array1.filter((value) => !array2.includes(value))

export const groupBy = (xs, key) =>
  xs.reduce(function (rv, x) {
    ;(rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})

export const yyyymmdd = (d) =>
  `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${(
    '0' + d.getDate()
  ).slice(-2)}`
