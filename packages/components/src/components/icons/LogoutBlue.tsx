import * as React from 'react'

export const LogoutBlue = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M14 22h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5"
      stroke="#5E93ED"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.707 7.293a1 1 0 1 0-1.414 1.414L12.586 11H3a1 1 0 1 0 0 2h9.586l-2.293 2.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414l-4-4z"
      fill="#5E93ED"
    />
  </svg>
)
