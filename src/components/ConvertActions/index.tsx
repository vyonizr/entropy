import React from 'react'

import ConvertVideoConfig from './components/ConvertVideoConfig'
import RescaleConfig from './components/RescaleConfig'
import OptimizeWhatsappConfig from './components/OptimizeWhatsappConfig'
import WaveFormConfig from './components/WaveFormConfig'
import VideoToGifConfig from './components/VideoToGifConfig'

type ConvertActionProps = {
  action: string
  file: File
}

export default function ConvertActions({ action, file }: ConvertActionProps) {
  switch (action) {
    case 'optimize-video-whatsapp':
      return <OptimizeWhatsappConfig file={file} />
    case 'rescale-video':
      return <RescaleConfig file={file} />
    case 'video-to-gif':
      return <VideoToGifConfig file={file} />
    case 'audio-to-waveform':
      return <WaveFormConfig file={file} />
    case 'convert-video':
    default:
      return <ConvertVideoConfig file={file} />
  }
}
