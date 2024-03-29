import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import Button from '@/components/Button'
import { FFMPEGContext } from '@/App'
import { generateOutputName, triggerDownload } from '@/utils'

type OptimizeWhatsappConfigProps = {
  file: File | null
}

export default function OptimizeWhatsappConfig({
  file,
}: OptimizeWhatsappConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG, setTargetFileSize } =
    React.useContext(FFMPEGContext)

  async function convertVideoToWhatsapp(selectedFile: File | null) {
    try {
      setIsLoading(true)
      setTargetFileSize(0)

      if (selectedFile) {
        const outputExtension = 'mp4'
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf scale=trunc(iw/2)*2:trunc(ih/2)*2 -c:v libx264 -profile:v baseline -level 3.0 -preset slow -crf 23 -c:a aac -b:a 128k -ac 2`
        const outputData = await runFFMPEG(selectedFile, outputName, method)
        if (outputData) {
          const blob = new Blob([outputData.buffer], {
            type: `video/${outputExtension}`,
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
      onClick={() => convertVideoToWhatsapp(file)}
      disabled={isLoading}
    >
      <FaRegPlayCircle className="mr-2" />
      <span>Optimize</span>
    </Button>
  )
}
