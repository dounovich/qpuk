import React from 'react'

export function Button({ className = '', variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-black text-white hover:opacity-90',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border border-gray-300 hover:bg-gray-50'
  }
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition'
  return (
    <button className={`${base} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  )
}
export default Button
