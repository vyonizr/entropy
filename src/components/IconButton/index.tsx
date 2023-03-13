import React from 'react'
import { FaTrash } from 'react-icons/fa'

interface ButtonProps {
  icon: string
  onClick: () => void
  disabled?: boolean
  className?: string
  primary?: boolean
}

function IconButton({
  icon,
  onClick,
  disabled,
  className: additionalClass,
  primary = false,
}: ButtonProps) {
  let className =
    'w-12 h-12 flex justify-center items-center disabled:bg-disabled disabled:text-white' +
    (additionalClass ? ` ${additionalClass}` : '') +
    (primary ? ' bg-primary text-white' : ' bg-white text-primary')

  function Icon({ icon }: { icon: string }) {
    switch (icon) {
      case 'trash':
      default:
        return <FaTrash />
    }
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <Icon icon={icon} />
    </button>
  )
}

export default IconButton
