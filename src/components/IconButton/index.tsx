import React from 'react'
import { FaTrash } from 'react-icons/fa'

interface ButtonProps {
  icon: string
  onClick: () => void
  disabled?: boolean
  className?: string
  primary?: boolean
  label?: string
}

function IconButton({
  icon,
  onClick,
  disabled,
  className: additionalClass,
  primary = false,
  label,
}: ButtonProps) {
  let className =
    'w-12 h-12 flex justify-center items-center disabled:bg-gray-200' +
    (additionalClass ? ` ${additionalClass}` : '') +
    (primary ? ' bg-primary' : '')

  function Icon({ icon, color }: { icon: string; color: string | undefined }) {
    switch (icon) {
      case 'trash':
      default:
        return <FaTrash color={color} />
    }
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled} aria-label={label}>
      <Icon icon={icon} color={disabled || primary ? 'white' : undefined} />
    </button>
  )
}

export default IconButton
