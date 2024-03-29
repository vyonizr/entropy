import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { generateOutputName, triggerDownload } from '@/utils'

type VideoToGifConfigProps = {
  file: File | null
}

export default function VideoToGifConfig({ file }: VideoToGifConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG, setTargetFileSize } =
    React.useContext(FFMPEGContext)

  async function videoToGIF(selectedFile: File | null) {
    try {
      setIsLoading(true)
      setTargetFileSize(0)

      if (selectedFile) {
        const outputExtension = 'gif'
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf fps=10,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse -loop 0`
        const outputData = await runFFMPEG(selectedFile, outputName, method)
        if (outputData) {
          const blob = new Blob([outputData.buffer], {
            type: `image/${outputExtension}`,
          })
          setTargetFileSize(blob.size)
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
      className="w-full max-w-[22rem] mt-4 flex items-center justify-center"
      onClick={() => videoToGIF(file)}
      disabled={isLoading}
    >
      <FaRegPlayCircle className="mr-2" />
      <span>Convert to GIF</span>
    </Button>
  )
}
