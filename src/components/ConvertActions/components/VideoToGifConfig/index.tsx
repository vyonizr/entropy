import React from 'react'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { generateOutputName, triggerDownload } from '@/utils'

type VideoToGifConfigProps = {
  file: File | null
}

export default function VideoToGifConfig({ file }: VideoToGifConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)

  async function videoToGIF(selectedFile: File | null) {
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputExtension = 'gif'
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf fps=10,scale=-2:360:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse -loop 0`
        const outputData = await runFFMPEG(selectedFile, outputName, method)
        if (outputData) {
          const blob = new Blob([outputData.buffer], {
            type: `image/${outputExtension}`,
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
      onClick={() => videoToGIF(file)}
      disabled={isLoading}
    >
      Convert to GIF
    </Button>
  )
}
