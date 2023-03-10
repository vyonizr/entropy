import React from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { RADIO_OPTIONS, VIDEO_EXTENSION_OPTIONS } from './constants'
import { trimFilename, generateOutputName } from './utils'

type ConvertActionProps = {
  action: string
  file: File
}

export default function Home() {
  const [progress, setProgress] = React.useState(0)
  const [mediaAction, setMediaAction] = React.useState(RADIO_OPTIONS[0].value)
  const [targetExtension, setTargetExtension] = React.useState(
    VIDEO_EXTENSION_OPTIONS[0].value
  )
  const ffmpeg = createFFmpeg({
    log: process.env.NODE_ENV === 'development',
    progress: ({ ratio }) => {
      setProgress(Math.round(ratio * 100))
    },
  })
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState(false)

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

  function triggerDownload(URL: string, fileName: string) {
    const anchor = document.createElement('a')
    anchor.href = URL
    anchor.download = fileName
    anchor.click()
  }

  async function runFFMPEG(
    selectedFile: File,
    outputName: string,
    method = ''
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
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputName = `${trimFilename(
          selectedFile.name
        )}_entropy.${outputExtension}`

        const outputData = await runFFMPEG(selectedFile, outputName)
        if (outputData) {
          const url = URL.createObjectURL(
            new Blob([outputData.buffer], { type: `video/${outputExtension}` })
          )
          triggerDownload(url, outputName)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function convertVideoToWhatsapp(selectedFile: File) {
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
          const url = URL.createObjectURL(
            new Blob([outputData.buffer], { type: `video/${outputExtension}` })
          )
          triggerDownload(url, outputName)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function videoToGIF(selectedFile: File) {
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
          const url = URL.createObjectURL(
            new Blob([outputData.buffer], { type: `image/${outputExtension}` })
          )
          triggerDownload(url, outputName)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function ConvertActions({ action, file }: ConvertActionProps) {
    switch (action) {
      case 'optimize-video-whatsapp':
        return (
          <button
            onClick={() => convertVideoToWhatsapp(file)}
            disabled={isLoading}
          >
            Optimize
          </button>
        )
      case 'video-to-gif':
        return (
          <button onClick={() => videoToGIF(file)} disabled={isLoading}>
            Convert to GIF
          </button>
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
            <button
              onClick={() => convertVideo(file, targetExtension)}
              disabled={isLoading}
            >
              Convert
            </button>
          </>
        )
    }
  }

  console.log(mediaAction, '<== mediaAction')

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
      <p>
        No files are uploaded to the server; the process is entirely done on the
        browser.
      </p>
      <input type='file' accept='video/*' onChange={handleFileChange} />

      {selectedFile && (
        <>
          {progress > 0 && <p>Transcoding... {progress}%</p>}
          <button onClick={() => setSelectedFile(null)} disabled={isLoading}>
            Clear
          </button>
          <p>Selected file: {selectedFile.name}</p>
          <ConvertActions action={mediaAction} file={selectedFile} />
          <video src={previewUrl} controls ref={videoRef} />
        </>
      )}
      <p>v{import.meta.env.PACKAGE_VERSION}</p>
    </main>
  )
}
