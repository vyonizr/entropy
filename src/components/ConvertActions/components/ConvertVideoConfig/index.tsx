import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { generateOutputName, triggerDownload } from '@/utils'

import { VIDEO_EXTENSION_OPTIONS } from './constants'

type ConvertVideoConfigProps = {
  file: File | null
}

export default function ConvertVideoConfig({ file }: ConvertVideoConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } =
    React.useContext(FFMPEGContext)
  const [targetExtension, setTargetExtension] = React.useState(
    VIDEO_EXTENSION_OPTIONS[0].value
  )

  async function convertVideo(
    selectedFile: File | null,
    outputExtension = 'mp4'
  ) {
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )

        const outputData = await runFFMPEG(selectedFile, outputName)
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
      <select
        className="w-full max-w-[22rem] mt-4 h-12 border-2 border-primary rounded-md px-2"
        value={targetExtension}
        onChange={(event) => setTargetExtension(event.target.value)}
        placeholder="Select target format"
        disabled={isLoading}
      >
        {VIDEO_EXTENSION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="h-12 px-2">
            {option.label}
          </option>
        ))}
      </select>
      <Button
        className="mt-2 flex items-center justify-center"
        onClick={() => convertVideo(file, targetExtension)}
        disabled={isLoading}
      >
        <FaRegPlayCircle className="mr-2" />
        <span> Convert to {targetExtension.toUpperCase()}</span>
      </Button>
    </>
  )
}
