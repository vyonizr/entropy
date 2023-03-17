import React from 'react'
import { FaRegPlayCircle } from 'react-icons/fa'

import { FFMPEGContext } from '@/App'
import Button from '@/components/Button'
import { generateOutputName, triggerDownload } from '@/utils'

type WaveFormConfigProps = {
  file: File | null
}

export default function WaveFormConfig({ file }: WaveFormConfigProps) {
  const { isLoading, setIsLoading, runFFMPEG } =
    React.useContext(FFMPEGContext)

  async function createWaveform(selectedFile: File | null) {
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputExtension = 'png'
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-filter_complex [0:a]aformat=channel_layouts=mono,showwavespic=s=1920x1080:colors=#ffffff -vframes 1 -c:v png -f image2pipe`
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
      className="w-full max-w-[22rem] mt-4 flex items-center justify-center"
      onClick={() => createWaveform(file)}
      disabled={isLoading}
    >
      <FaRegPlayCircle className="mr-2" />
      <span>Create waveform</span>
    </Button>
  )
}
