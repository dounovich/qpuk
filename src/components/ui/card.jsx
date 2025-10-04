import React from 'react'

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>{children}</div>
}
export function CardHeader({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
export function CardTitle({ className = '', children }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
}
export function CardContent({ className = '', children }) {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>
}
export default Card
