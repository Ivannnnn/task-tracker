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

export const useCollection = ({
  on = { update: () => {}, create: () => {}, remove: () => {} },
}) => {
  const [data, updateData] = useImmer({
    byId: {},
    byOrder: [],
    activeId: null,
  })

  function load(data) {
    updateData(() => ({
      byId: data,
      byOrder: sortBy(Object.values(data), 'order').map((props) => props.id),
    }))
  }

  function get(id) {
    return data.byId[id]
  }

  function create({ id = uuid(), title }) {
    updateData((data) => {
      data.byId[id] = { id, title, order: data.byOrder.length }
      data.byOrder.push(id)
      on.create({ ...data.byId[id] })
    })
  }

  function remove(index) {
    updateData((data) => {
      const id = data.byOrder[index]
      const item = { ...data.byId[id] }
      delete data.byId[id]
      data.byOrder.splice(index, 1)
      on.update(item)
    })
  }

  function update({ id, ...props }) {
    on.update({ id, ...props })
    updateData((data) => {
      Object.assign(data.byId[id], props)
    })
  }

  function moveUp(index) {
    if (index < 1) return
    updateData((data) => {
      const id = data.byOrder[index]
      const prevId = data.byOrder[index - 1]
      data.byId[id].order--
      data.byId[prevId].order++
      on.update({ ...data.byId[id] })
      on.update({ ...data.byId[prevId] })
      arraySwap(data.byOrder, index, index - 1)
    })
  }

  function moveDown(index) {
    if (index >= data.byOrder.length - 1) return
    updateData((data) => {
      const id = data.byOrder[index]
      const prevId = data.byOrder[index + 1]
      data.byId[id].order++
      data.byId[prevId].order--
      on.update({ ...data.byId[id] })
      on.update({ ...data.byId[prevId] })
      arraySwap(data.byOrder, index, index + 1)
    })
  }

  function map(cb) {
    return data.byOrder.map((id, i) =>
      cb({ ...data.byId[id], active: id === data.activeId }, i)
    )
  }

  function activate(id) {
    updateData((data) => {
      data.activeId = id
    })
  }

  return {
    load,
    get,
    create,
    remove,
    update,
    moveUp,
    moveDown,
    map,
    activate,
  }
}
