import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'
import { TbFlipHorizontal, TbFlipVertical } from 'react-icons/tb'

import Button from '@/components/Button'
import { FFMPEGContext } from '@/App'
import { getFileExtension, generateOutputName, triggerDownload } from '@/utils'

import { FLIP_OPTIONS } from './constants'

type FlipVideoConfigProps = {
  file: File | null
}

export default function FlipVideoConfig({ file }: FlipVideoConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)

  const [flipMode, setFlipMode] = React.useState(FLIP_OPTIONS[0].value)

  async function flipVideo(selectedFile: File | null) {
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputExtension = getFileExtension(selectedFile.name)
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf ${flipMode}`
        const outputData = await runFFMPEG(selectedFile, outputName, method)
        if (outputData) {
          const blob = new Blob([outputData.buffer], {
            type: `video/${outputExtension}`,
          })
          const url = URL.createObjectURL(blob)
          triggerDownload(url, outputName)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <ul className="mt-4">
        {FLIP_OPTIONS.map((option) => (
          <li key={option.value} className="flex">
            <input
              type="radio"
              name="target-resolution"
              value={option.label}
              id={option.value}
              checked={flipMode === option.value}
              onChange={() => setFlipMode(option.value)}
              disabled={isLoading}
            />
            <label htmlFor={option.value} className="ml-1 flex items-center">
              {option.value === 'hflip' ? (
                <TbFlipVertical />
              ) : (
                <TbFlipHorizontal />
              )}
              <span className="ml-1">{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <Button
        className="w-full max-w-[22rem] mt-4 flex items-center justify-center"
        onClick={() => flipVideo(file)}
        disabled={isLoading}
      >
        <FaRegPlayCircle className="mr-2" />
        <span>Flip {flipMode === 'hflip' ? 'Horizontally' : 'Vertically'}</span>
      </Button>
    </>
  )
}
