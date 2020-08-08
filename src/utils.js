import { useState } from 'react'

const padZero = (val, n) =>
  val.toString().length > n ? val : ('0' + val).slice(n * -1)

const startOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0))

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

function parseIfJSON(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}

export const proxyStorage = new Proxy(
  {},
  {
    get(_, prop) {
      const data = localStorage[prop]
      return parseIfJSON(data) || data
    },
    set(_, prop, value) {
      try {
        typeof value === 'object'
          ? (localStorage[prop] = JSON.stringify(value))
          : (localStorage[prop] = value)
        return true
      } catch (e) {
        return false
      }
    },
    deleteProperty(_, prop) {
      delete localStorage[prop]
      return true
    },
  }
)
