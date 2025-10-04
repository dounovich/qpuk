import React from 'react'

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-9 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-black ${className}`}
      {...props}
    />
  )
}
export default Input
