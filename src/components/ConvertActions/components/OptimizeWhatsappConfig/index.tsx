import React from 'react'

import Button from '@/components/Button'
import { FFMPEGContext } from '@/App'
import { generateOutputName, triggerDownload } from '@/utils'

type OptimizeWhatsappConfigProps = {
  file: File | null
}

export default function OptimizeWhatsappConfig({
  file,
}: OptimizeWhatsappConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } = React.useContext(FFMPEGContext)

  async function convertVideoToWhatsapp(selectedFile: File | null) {
    try {
      setIsLoading(true)

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
      onClick={() => convertVideoToWhatsapp(file)}
      disabled={isLoading}
    >
      Optimize
    </Button>
  )
}
