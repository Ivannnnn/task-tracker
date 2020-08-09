import { useCallback, useState, useRef, useEffect } from 'react'
import produce from 'immer'

export function useImmer(initialValue) {
  const [val, updateValue] = useState(initialValue)
  return [
    val,
    useCallback((updater) => {
      updateValue(produce(updater))
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
