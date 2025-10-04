import React from 'react'

// Minimal compatible Slider: value is [number]; onValueChange([number])
export function Slider({ value = [0], onValueChange, min = 0, max = 100, step = 1, className = '' }) {
  const v = value[0] ?? 0
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange && onValueChange([Number(e.target.value)])}
      className={`w-full accent-black ${className}`}
    />
  )
}
export default Slider
