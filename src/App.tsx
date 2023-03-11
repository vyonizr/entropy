import React, { useMemo } from 'react'
import { fetchFile } from '@ffmpeg/ffmpeg'
import { RADIO_OPTIONS, VIDEO_EXTENSION_OPTIONS } from './constants'
import { trimFilename, generateOutputName } from './utils'

import useFFMPEG from './hooks/useFFMPEG'

type ConvertActionProps = {
  action: string
  file: File
}

export default function Home() {
  const { progress, ffmpeg } = useFFMPEG()
  const [mediaAction, setMediaAction] = React.useState(RADIO_OPTIONS[0])
  const [targetExtension, setTargetExtension] = React.useState(
    VIDEO_EXTENSION_OPTIONS[0].value
  )
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const inputFileRef = React.useRef<HTMLInputElement>(null)

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

      const writeData = ffmpeg.FS('readFile', outputName)
      ffmpeg.exit()

      return writeData
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

  async function createWaveform(selectedFile: File) {
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
      case 'audio-to-waveform':
        return (
          <button onClick={() => createWaveform(file)} disabled={isLoading}>
            Create waveform
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

  const acceptedFileTypes = useMemo(
    () => (mediaAction.type === 'video' ? 'video/*' : 'audio/*'),
    [mediaAction.type]
  )

  function handleClearFile() {
    setSelectedFile(null)
    if (inputFileRef !== null && inputFileRef.current !== null) {
      inputFileRef.current.files = null
    }
  }

  return (
    <main>
      <form>
        <ul>
          {RADIO_OPTIONS.map((option) => (
            <li key={option.value} onChange={() => setMediaAction(option)}>
              <input
                type='radio'
                name='media-action'
                value={option.label}
                id={option.value}
                checked={mediaAction.value === option.value}
              />
              <label htmlFor={option.value}>{option.label}</label>
            </li>
          ))}
        </ul>
        <p>
          No files are uploaded to the server; the process is entirely done on
          the browser.
        </p>
        <input
          ref={inputFileRef}
          type='file'
          accept={acceptedFileTypes}
          onChange={handleFileChange}
        />

        {selectedFile && (
          <>
            {progress > 0 && <p>Transcoding... {progress}%</p>}
            <button onClick={handleClearFile} disabled={isLoading}>
              Clear
            </button>
            <p>Selected file: {selectedFile.name}</p>
            <ConvertActions action={mediaAction.value} file={selectedFile} />
            <video src={previewUrl} controls ref={videoRef} />
          </>
        )}
      </form>
      <p>v{import.meta.env.PACKAGE_VERSION}</p>
    </main>
  )
}
