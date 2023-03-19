import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { getFileExtension, generateOutputName, triggerDownload } from '@/utils'

import { RESCALE_OPTIONS } from './constants'

type RescaleConfigProps = {
  file: File | null
}

const VALID_DIMENSION_REGEX = new RegExp(/^[1-9]\d*$/)
// const INVALID_DIMENSION_REGEX = new RegExp(/^(?!^[1-9]\d*$).*$/)

export default function RescaleConfig({ file }: RescaleConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)
  const [targetResolution, setTargetResolution] = React.useState(
    RESCALE_OPTIONS[0].value
  )
  const [customResolution, setCustomResolution] = React.useState({
    width: '',
    height: '',
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
        let method = `-vf scale=-2:${targetResolution}`

        if (targetResolution === 'custom') {
          method = `-vf scale=trunc(${customResolution.width}/2)*2:trunc(${customResolution.height}/2)*2`
        }
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

  const isCustomResolutionDisabled = React.useMemo(() => {
    return (
      targetResolution === 'custom' &&
      (!VALID_DIMENSION_REGEX.test(customResolution.width) ||
        !VALID_DIMENSION_REGEX.test(customResolution.height))
    )
  }, [targetResolution, customResolution])

  function handleDimensionInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    if (VALID_DIMENSION_REGEX.test(value) || value.length === 0) {
      setCustomResolution({
        ...customResolution,
        [name]: value,
      })
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
            <label htmlFor={option.value} className="ml-1">
              {option.label}
            </label>
          </li>
        ))}
      </ul>
      {targetResolution === 'custom' && (
        <div className="w-40 mt-2 flex justify-center items-center">
          <input
            type="number"
            name="width"
            placeholder="Width"
            className="p-2 w-24 rounded border-2 border-gray-200"
            value={customResolution.width}
            onChange={handleDimensionInput}
            disabled={isLoading}
            min="1"
          />
          <span className="mx-2">&times;</span>
          <input
            type="number"
            name="height"
            placeholder="Height"
            className="p-2 w-24 rounded border-2 border-gray-200"
            value={customResolution.height}
            onChange={handleDimensionInput}
            disabled={isLoading}
            min="1"
          />
          <p className="ml-2">px</p>
        </div>
      )}
      <Button
        className="w-full max-w-[22rem] mt-4 flex items-center justify-center"
        onClick={() => rescaleVideo(file)}
        disabled={isLoading || isCustomResolutionDisabled}
      >
        <FaRegPlayCircle className="mr-2" />
        <span>Rescale</span>
      </Button>
    </>
  )
}
