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
    'w-12 h-12 flex justify-center items-center rounded-full disabled:bg-disabled disabled:text-white' +
    (additionalClass ? ` ${additionalClass}` : '') +
    (primary
      ? ' bg-primary text-white'
      : ' bg-white text-primary border-primary border-2')

  function Icon({ icon }: { icon: string }) {
    // const primaryIcon = 'text-white'
    const secondaryIcon = 'text-primary'
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
