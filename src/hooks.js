import { useEffect, useRef, useCallback, useState } from 'react'
import produce from 'immer'

export function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export function useImmer(initialValue) {
  const [val, updateValue] = useState(initialValue)
  return [
    val,
    useCallback((updater) => {
      updateValue(produce(updater))
    }, []),
  ]
}
