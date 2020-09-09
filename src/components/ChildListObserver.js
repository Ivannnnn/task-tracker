import React, { useEffect, useRef } from 'react'

export default function ChildListObserver({
  type = 'div',
  children,
  onInsert,
  ...props
}) {
  const ref = useRef()

  useEffect(() => {
    const observer = new MutationObserver((mutations) =>
      onInsert(mutations, ref.current)
    )
    observer.observe(ref.current, { childList: true })
  }, [])

  return React.createElement(type, { ref, ...props }, children)
}
