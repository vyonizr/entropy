import React from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const RADIO_OPTIONS = [
  {
    label: 'Convert Video',
    value: 'convert-video',
  },
  {
    label: 'Optimize Video for Whatsapp',
    value: 'optimize-video-whatsapp',
  },
]

const VIDEO_EXTENSION_OPTIONS = [
  {
    label: 'MP4',
    value: 'mp4',
  },
  {
    label: 'MOV',
    value: 'mov',
  },
  {
    label: 'WMV',
    value: 'wmv',
  },
  {
    label: 'AVI',
    value: 'avi',
  },
  {
    label: 'MKV',
    value: 'mkv',
  },
]

type ConvertActionProps = {
  action: string
  file: File
}

export default function Home() {
  const [progress, setProgress] = React.useState(0)
  const [mediaAction, setMediaAction] = React.useState('convert-video')
  const [targetExtension, setTargetExtension] = React.useState(
    VIDEO_EXTENSION_OPTIONS[0].value
  )
  const ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
      setProgress(Math.round(ratio * 100))
    },
  })
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>('')
  // const [isPlaying, setIsPlaying] = React.useState(false)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
    }
  }

  function trimFilename(filename: string) {
    const lastDot = filename.lastIndexOf('.')
    return filename.substring(0, lastDot)
  }

  function generateOutputName(fileName: string, extension: string) {
    return `${trimFilename(fileName)}_entropy.${extension}`
  }

  function triggerDownload(URL: string, fileName: string) {
    const anchor = document.createElement('a')
    anchor.href = URL
    anchor.download = fileName
    anchor.click()
  }

  async function runFFMPEG(
    selectedFile: File,
    method: string,
    outputName: string
  ) {
    if (selectedFile) {
      await ffmpeg.load()
      ffmpeg.FS('writeFile', selectedFile.name, await fetchFile(selectedFile))
      await ffmpeg.run(
        '-i',
        selectedFile.name,
        ...method.split(' '),
        outputName
      )

      return ffmpeg.FS('readFile', outputName)
    }
  }

  async function convertVideo(selectedFile: File, outputExtension = 'mp4') {
    if (selectedFile) {
      const outputName = `${trimFilename(
        selectedFile.name
      )}_entropy.${outputExtension}`
      await ffmpeg.load()
      ffmpeg.FS('writeFile', selectedFile.name, await fetchFile(selectedFile))
      await ffmpeg.run('-i', selectedFile.name, outputName)
      const outputData = ffmpeg.FS('readFile', outputName)
      const url = URL.createObjectURL(
        new Blob([outputData.buffer], { type: `video/${outputExtension}` })
      )
      triggerDownload(url, outputName)
    }
  }

  async function convertVideoToWhatsapp(selectedFile: File) {
    try {
      if (selectedFile) {
        const outputExtension = 'mp4'
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = `-vf scale=trunc(iw/2)*2:trunc(ih/2)*2 -c:v libx264 -profile:v baseline -level 3.0 -preset slow -crf 23 -c:a aac -b:a 128k -ac 2`
        const outputData = await runFFMPEG(selectedFile, method, outputName)
        if (outputData) {
          const url = URL.createObjectURL(
            new Blob([outputData.buffer], { type: `video/${outputExtension}` })
          )
          triggerDownload(url, outputName)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  function ConvertActions({ action, file }: ConvertActionProps) {
    switch (action) {
      case 'optimize-video-whatsapp':
        return (
          <button onClick={() => convertVideoToWhatsapp(file)}>Optimize</button>
        )
      case 'convert-video':
      default:
        return (
          <>
            <label>
              to:
              <select
                value={targetExtension}
                onChange={(event) => setTargetExtension(event.target.value)}
              >
                {VIDEO_EXTENSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => convertVideo(file, targetExtension)}>
              Convert
            </button>
          </>
        )
    }
  }

  return (
    <main>
      <ul>
        {RADIO_OPTIONS.map((option) => (
          <li key={option.value} onChange={() => setMediaAction(option.value)}>
            <input
              type='radio'
              name='media-action'
              value={option.label}
              id={option.value}
              checked={mediaAction === option.value}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </li>
        ))}
      </ul>
      <input type='file' accept='video/*' onChange={handleFileChange} />

      {selectedFile && (
        <>
          {progress > 0 && <p>{progress}%</p>}
          <button onClick={() => setSelectedFile(null)}>Clear</button>
          <p>Selected file: {selectedFile.name}</p>
          <ConvertActions action={mediaAction} file={selectedFile} />
          <video src={previewUrl} controls ref={videoRef} />
        </>
      )}
    </main>
  )
}
