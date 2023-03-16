import React from 'react'

import ConvertVideoConfig from './components/ConvertVideoConfig'
import RescaleConfig from './components/RescaleConfig'
import OptimizeWhatsappConfig from './components/OptimizeWhatsappConfig'
import WaveFormConfig from './components/WaveFormConfig'
import VideoToGifConfig from './components/VideoToGifConfig'
import ConvertAudioConfig from './components/ConvertAudioConfig'
import FlipVideoConfig from './components/FlipVideoConfig'

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
    case 'flip-video':
      return <FlipVideoConfig file={file} />
    case 'convert-audio':
      return <ConvertAudioConfig file={file} inputType="audio" />
    case 'video-to-audio':
      return <ConvertAudioConfig file={file} inputType="video" />
    case 'video-to-gif':
      return <VideoToGifConfig file={file} />
    case 'audio-to-waveform':
      return <WaveFormConfig file={file} />
    case 'convert-video':
    default:
      return <ConvertVideoConfig file={file} />
  }
}
