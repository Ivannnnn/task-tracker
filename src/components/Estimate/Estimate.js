import React, { useRef, useEffect } from 'react'
import { secsToTime } from 'utils'
import durationPicker from './durationPicker/durationPicker'

function timeToSecs(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 * 60 + minutes * 60
}

export default function Estimate({
  value: seconds,
  onChange,
  className,
  ...props
}) {
  const ref = useRef()

  useEffect(() => {
    return durationPicker(ref.current, {
      onChange: (time) => onChange(timeToSecs(time)),
    })
  }, [])

  return (
    <input
      type="text"
      ref={ref}
      defaultValue={secsToTime(seconds)}
      className={className}
      {...props}
    />
  )
}
