import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}

function Button({
  children,
  onClick,
  disabled,
  className: additionalClass,
}: ButtonProps) {
  let className =
    'w-full max-w-[22rem] h-12 font-medium bg-primary p-2 text-white rounded disabled:bg-disabled' +
    (additionalClass ? ` ${additionalClass}` : '')

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
