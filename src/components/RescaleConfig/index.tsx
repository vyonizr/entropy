import React from 'react'

import Button from '@/components/Button'
import { FFMPEGContext } from '@/App'
import { getFileExtension, generateOutputName, triggerDownload } from '@/utils'

type RescaleConfigProps = {
  file: File | null
}

export default function RescaleConfig({ file }: RescaleConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)

  async function rescaleVideoTo360p(selectedFile: File | null) {
    try {
      setIsLoading(true)
      if (selectedFile) {
        const outputExtension = getFileExtension(selectedFile.name)
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = '-vf scale=-2:360'
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
    <Button
      className='mt-4'
      onClick={() => rescaleVideoTo360p(file)}
      disabled={isLoading}
    >
      Rescale
    </Button>
  )
}
