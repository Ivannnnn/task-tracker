export const on = (el, events) => {
  for (let name in events) el.addEventListener(name, events[name])
}

export const off = (el, events) => {
  for (let name in events) el.removeEventListener(name, events[name])
}

export function State(state = {}) {
  const watchers = {}

  const update = (fresh) => {
    for (let key in fresh) {
      if (state[key] !== fresh[key]) {
        state[key] = fresh[key]
        watchers[key] && watchers[key].forEach((f) => f(fresh[key]))
      }
    }
  }

  const watch = (watchersObj) => {
    for (let prop in watchersObj) {
      watchers[prop]
        ? watchers[prop].push(watchersObj[prop])
        : (watchers[prop] = [watchersObj[prop]])
    }
  }

  return [state, update, watch]
}
