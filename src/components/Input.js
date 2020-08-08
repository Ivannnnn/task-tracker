import React from 'react'

export default function Input({ onChange, type = 'text', ...props }) {
  return (
    <input type={type} {...props} onChange={(e) => onChange(e.target.value)} />
  )
}
