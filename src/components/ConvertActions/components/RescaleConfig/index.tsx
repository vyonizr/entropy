import React from 'react'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { getFileExtension, generateOutputName, triggerDownload } from '@/utils'

import { RESCALE_OPTIONS } from './constants'

type RescaleConfigProps = {
  file: File | null
}

export default function RescaleConfig({ file }: RescaleConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)
  const [targetResolution, setTargetResolution] = React.useState(
    RESCALE_OPTIONS[0].value
  )
  async function rescaleVideo(selectedFile: File | null) {
    try {
      setIsLoading(true)
      if (selectedFile) {
        const outputExtension = getFileExtension(selectedFile.name)
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf scale=-2:${targetResolution}`
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
      <ul className='mt-4 flex'>
        {RESCALE_OPTIONS.map((option) => (
          <li key={option.value} className='mx-2'>
            <input
              type='radio'
              name='target-resolution'
              value={option.label}
              id={option.value}
              checked={targetResolution === option.value}
              onChange={() => setTargetResolution(option.value)}
              disabled={isLoading}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </li>
        ))}
      </ul>
      <Button
        className='mt-4'
        onClick={() => rescaleVideo(file)}
        disabled={isLoading}
      >
        Rescale
      </Button>
    </>
  )
}
