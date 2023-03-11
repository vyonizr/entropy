import React from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

function useFFMPEG() {
  const [progress, setProgress] = React.useState(0)

  const ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
      setProgress(Math.round(ratio * 100))
    },
  })

  return { progress, ffmpeg }
}

export default useFFMPEG
