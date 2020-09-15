import { useCallback, useState, useRef, useEffect } from 'react'
import produce from 'immer'
import { sortBy, arraySwap } from 'utils'

export function useImmer(initialValue) {
  const [val, updateValue] = useState(initialValue)
  return [
    val,
    useCallback((updater) => {
      updateValue(
        produce(typeof updater === 'function' ? updater : () => updater)
      )
    }, []),
  ]
}

export function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => savedCallback.current()
    if (delay) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export const useOrderable = (orderBy) => {
  const [items, updateItems] = useImmer([])

  function set(data) {
    updateItems(sortBy(data, orderBy, 'desc'))
  }
  function add(props) {
    return new Promise((resolve) => {
      const revert = () => updateItems(() => items)
      updateItems((items) => {
        const firstItem = items[0]
        const orderValue = firstItem ? firstItem[orderBy] + 1 : 0
        const item = { ...props, [orderBy]: orderValue }
        items.unshift(item)
        resolve([orderValue, revert])
      })
    })
  }
  function remove(index) {
    const revert = () => updateItems(() => items)
    return new Promise((resolve) => {
      updateItems((items) => {
        const item = items[index]
        items.splice(index, 1)
        resolve([{ ...item }, revert])
      })
    })
  }
  function update(index, props) {
    const revert = () => updateItems(() => items)
    return new Promise((resolve) => {
      updateItems((items) => {
        Object.assign(items[index], props)
        resolve([{ ...items[index] }, revert])
      })
    })
  }
  function move(direction, targetIndex) {
    const revert = () => updateItems(() => items)
    return new Promise((resolve) => {
      const strategy = {
        up: () =>
          targetIndex > 0 &&
          updateItems((items) => {
            const prevIndex = targetIndex - 1
            const prevOrderVal = items[prevIndex][orderBy]
            const targetOrderVal = items[targetIndex][orderBy]
            items[prevIndex][orderBy] = targetOrderVal
            items[targetIndex][orderBy] = prevOrderVal
            arraySwap(items, targetIndex, prevIndex)
            resolve([
              { ...items[targetIndex] },
              { ...items[prevIndex] },
              revert,
            ])
          }),
        down: () =>
          targetIndex < items.length - 1 &&
          updateItems((items) => {
            const nextIndex = targetIndex + 1
            const nextOrderVal = items[nextIndex][orderBy]
            const targetOrderVal = items[targetIndex][orderBy]
            items[nextIndex][orderBy] = targetOrderVal
            items[targetIndex][orderBy] = nextOrderVal
            arraySwap(items, targetIndex, nextIndex)
            resolve([
              { ...items[targetIndex] },
              { ...items[nextIndex] },
              revert,
            ])
          }),
      }[direction]()
    })
  }

  return [items, { set, add, remove, update, move }]
}

const currentLocation = () => {
  return window.location.hash.replace(/^#/, '') || '/'
}

export const useHashLocation = () => {
  const [loc, setLoc] = useState(currentLocation())

  useEffect(() => {
    const handler = () => setLoc(currentLocation())

    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = useCallback((to) => (window.location.hash = to), [])

  return [loc, navigate]
}
