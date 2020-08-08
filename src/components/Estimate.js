import React, { useState } from 'react'
import Input from 'components/Input'
import { secsToTime } from 'utils'

export default function Estimate({ value: seconds, onChange }) {
  const [hovered, setHovered] = useState(false)
  return hovered ? (
    <Input
      type="number"
      step="0.25"
      onMouseLeave={() => setHovered(false)}
      value={seconds / 60}
      onChange={(val) => onChange(val * 60)}
    />
  ) : (
    <Input
      readOnly
      onMouseEnter={() => setHovered(true)}
      value={secsToTime(seconds)}
    />
  )
}
