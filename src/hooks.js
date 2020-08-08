import { useCallback, useState } from 'react'
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
