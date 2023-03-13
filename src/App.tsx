import React, { useMemo } from 'react'
import { fetchFile } from '@ffmpeg/ffmpeg'
import { RADIO_OPTIONS, VIDEO_EXTENSION_OPTIONS } from './constants'
import {
  truncateFileName,
  generateOutputName,
  getFileExtension,
  triggerDownload,
} from './utils'

import Button from './components/Button'
import IconButton from './components/IconButton'
import FileInput from './components/FileInput'
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

  function handleFileChange(file: File | null) {
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
    }
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
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )

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

  async function rescaleVideoTo360p(selectedFile: File) {
    try {
      setIsLoading(true)

      if (selectedFile) {
        const outputExtension = getFileExtension(selectedFile.name)
        const outputName = generateOutputName(
          selectedFile.name,
          outputExtension
        )
        const method = '-vf scale=-2:360'
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

  function ConvertActions({ action, file }: ConvertActionProps) {
    switch (action) {
      case 'optimize-video-whatsapp':
        return (
          <Button
            className='mt-4'
            onClick={() => convertVideoToWhatsapp(file)}
            disabled={isLoading}
          >
            Optimize
          </Button>
        )
      case 'rescale-video':
        return (
          <Button
            className='mt-4'
            onClick={() => rescaleVideoTo360p(file)}
            disabled={isLoading}
          >
            Rescale
          </Button>
        )
      case 'video-to-gif':
        return (
          <Button
            className='mt-4'
            onClick={() => videoToGIF(file)}
            disabled={isLoading}
          >
            Convert to GIF
          </Button>
        )
      case 'audio-to-waveform':
        return (
          <Button
            className='mt-4'
            onClick={() => createWaveform(file)}
            disabled={isLoading}
          >
            Create waveform
          </Button>
        )
      case 'convert-video':
      default:
        return (
          <>
            <select
              className='w-full max-w-[20rem] mt-4 h-12 border-2 border-primary rounded-md'
              value={targetExtension}
              onChange={(event) => setTargetExtension(event.target.value)}
              placeholder='Select target format'
              disabled={isLoading}
            >
              {VIDEO_EXTENSION_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className='h-12'
                >
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              className='mt-2'
              onClick={() => convertVideo(file, targetExtension)}
              disabled={isLoading}
            >
              Convert to {targetExtension.toUpperCase()}
            </Button>
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

  React.useEffect(() => {
    handleClearFile()
  }, [mediaAction.type])

  return (
    <main className='flex flex-col items-center px-4 pt-4 pb-2'>
      <h1 className='text-3xl'>Entropy</h1>
      <h2 className='mt-4'>
        A web-based media converter entirely done on the browser{' '}
        <strong>without</strong> file upload
      </h2>
      <ul className='mt-4'>
        {RADIO_OPTIONS.map((option) => (
          <li key={option.value}>
            <input
              type='radio'
              name='media-action'
              value={option.label}
              id={option.value}
              checked={mediaAction.value === option.value}
              onChange={() => setMediaAction(option)}
              disabled={isLoading}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </li>
        ))}
      </ul>
      <FileInput
        className='mt-4'
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={isLoading}
      >
        {`${selectedFile ? 'Change' : 'Select'} File`}
      </FileInput>
      {selectedFile && (
        <>
          <p className='mt-4'>
            Selected file:{' '}
            <span className='font-mono text-sm'>
              {truncateFileName(selectedFile.name)}
            </span>
          </p>
          <IconButton
            icon='trash'
            onClick={handleClearFile}
            disabled={isLoading}
          />
          <video
            className='object-cover max-h-52 mt-4'
            src={previewUrl}
            controls
            ref={videoRef}
          />
          <ConvertActions action={mediaAction.value} file={selectedFile} />
        </>
      )}
      {progress > 0 && (
        <>
          <p className='mt-2'>Transcoding... {progress}%</p>
          <div className='w-full max-w-[20rem] h-2 bg-gray-300 rounded overflow-hidden'>
            <div
              className='h-2 bg-primary'
              style={{ width: `${progress}%`, transitionDuration: '100ms' }}
            />
          </div>
        </>
      )}
      <p className='mt-4'>v{import.meta.env.PACKAGE_VERSION}</p>
    </main>
  )
}
