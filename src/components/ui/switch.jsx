import React from 'react'

export function Switch({ checked, onCheckedChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'bg-black' : 'bg-gray-300'}`}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}
export default Switch
