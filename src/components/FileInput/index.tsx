import React, { ChangeEvent } from 'react'

import Button from '@/components/Button'

type FileInputProps = {
  children: React.ReactNode
  onChange: (file: File | null) => void
  accept?: string
  className?: string
  disabled?: boolean
}

const FileInput: React.FC<FileInputProps> = ({
  children,
  onChange,
  accept,
  className: additionalClass,
  disabled = false,
}) => {
  const inputFileRef = React.useRef<HTMLInputElement>(null)
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onChange(file)
  }

  return (
    <>
      <input
        ref={inputFileRef}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='hidden'
      />
      <Button
        className={additionalClass ? ` ${additionalClass}` : ''}
        onClick={() => inputFileRef.current?.click()}
        disabled={disabled}
      >
        {children}
      </Button>
    </>
  )
}

export default FileInput
