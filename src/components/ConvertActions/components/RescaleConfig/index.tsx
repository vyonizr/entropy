import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { getFileExtension, generateOutputName, triggerDownload } from '@/utils'

import { RESCALE_OPTIONS } from './constants'

type RescaleConfigProps = {
  file: File | null
}

export default function RescaleConfig({ file }: RescaleConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } =
    React.useContext(FFMPEGContext)
  const [targetResolution, setTargetResolution] = React.useState(
    RESCALE_OPTIONS[0].value
  )
  const [customResolution, setCustomResolution] = React.useState({
    width: 0,
    height: 0,
  })
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
      <ul className="mt-4 flex">
        {RESCALE_OPTIONS.map((option) => (
          <li key={option.value} className="mx-2">
            <input
              type="radio"
              name="target-resolution"
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
      {targetResolution === 'custom' && (
        <div>
          <input
            type="number"
            name="custom-width"
            value={customResolution.width}
            onChange={(e) =>
              setCustomResolution({
                ...customResolution,
                width: parseInt(e.target.value),
              })
            }
            disabled={isLoading}
          />
          <span className="mx-2">&times;</span>
          <input
            type="number"
            name="custom-height"
            value={customResolution.height}
            onChange={(e) =>
              setCustomResolution({
                ...customResolution,
                height: parseInt(e.target.value),
              })
            }
            disabled={isLoading}
          />
        </div>
      )}
      <Button
        className="mt-4 flex items-center justify-center"
        onClick={() => rescaleVideo(file)}
        disabled={isLoading}
      >
        <FaRegPlayCircle className="mr-2" />
        <span>Rescale</span>
      </Button>
    </>
  )
}
