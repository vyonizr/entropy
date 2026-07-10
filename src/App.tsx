import React from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import {
  FaExchangeAlt,
  FaFileVideo,
  FaFileAudio,
  FaGithub,
} from 'react-icons/fa'
import Balancer from 'react-wrap-balancer'

import { RADIO_OPTIONS } from './constants'
import {
  truncateFileName,
  getEmojiFromType,
  capitalizeFirstLetter,
  parseFFmpegTimeLog,
  calculateTimeRemaining,
  formatTimeRemaining,
  getFileSize,
} from './utils'

import IconButton from './components/IconButton'
import FileInput from './components/FileInput'
import ConvertActions from './components/ConvertActions'

export const FFMPEGContext = React.createContext({
  isLoading: false,
  setIsLoading: (_loading: boolean) => {},
  progress: 0,
  setProgress: (_progress: number) => {},
  targetFileSize: 0,
  setTargetFileSize: (_targetFileSize: number) => {},
  targetDownloadUrl: '',
  setTargetDownloadUrl: (_targetDownloadUrl: string) => {},
  runFFMPEG: (
    _selectedFile: File,
    _outputName: string,
    _method?: string
  ): Promise<Uint8Array<ArrayBuffer> | undefined> => Promise.resolve(undefined),
})

const MAXIMUM_FILE_SIZE = '1GB'

export default function Home() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const audioRef = React.useRef<HTMLVideoElement>(null)
  const inputFileRef = React.useRef<HTMLInputElement>(null)
  const githubIconRef = React.useRef<HTMLAnchorElement>(null)

  const [isLoading, setIsLoading] = React.useState(false)
  const [isCoreLoading, setIsCoreLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [targetFileSize, setTargetFileSize] = React.useState(0)
  const [targetDownloadUrl, setTargetDownloadUrl] = React.useState('')
  const [timeRemaining, setTimeRemaining] = React.useState<string | null>(null)
  const [mediaAction, setMediaAction] = React.useState(RADIO_OPTIONS[0])
  const [error, setError] = React.useState({
    isError: false,
    message: '',
  })

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>('')

  function handleFileChange(file: File | null) {
    if (file && checkMaximumFileSize(file.size)) {
      resetProgress()
      setSelectedFile(file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
    }
  }

  function checkMaximumFileSize(fileSize: number) {
    if (fileSize > 1073741824) {
      setError({
        isError: true,
        message: `Maximum file size is ${MAXIMUM_FILE_SIZE}`,
      })
      handleClearFile()
      return false
    } else {
      setError({
        isError: false,
        message: '',
      })
    }

    return true
  }

  async function runFFMPEG(
    selectedFile: File,
    outputName: string,
    method = ''
  ) {
    try {
      if (selectedFile) {
        const ffmpeg = new FFmpeg()

        ffmpeg.on('progress', ({ progress: ratio }) => {
          setProgress(Math.round(ratio * 100))
          setIsCoreLoading(false)
        })

        ffmpeg.on('log', ({ message }) => {
          if (import.meta.env.DEV) {
            console.log(message)
          }
          const timeLog = parseFFmpegTimeLog(message)
          if (
            timeLog &&
            videoRef.current &&
            !isNaN(videoRef.current.duration)
          ) {
            const { time, speed } = timeLog
            const videoDuration = videoRef.current.duration
            const timeRemaining = calculateTimeRemaining(
              videoDuration,
              time,
              speed
            )
            setTimeRemaining(formatTimeRemaining(timeRemaining))
          }
        })

        setIsCoreLoading(true)
        await ffmpeg.load({
          coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
        })
        await ffmpeg.writeFile(selectedFile.name, await fetchFile(selectedFile))
        await ffmpeg.exec([
          '-i',
          selectedFile.name,
          ...method.split(' '),
          outputName,
        ])

        const writeData = await ffmpeg.readFile(outputName)
        await ffmpeg.terminate()
        setTimeRemaining(null)
        setIsCoreLoading(false)

        return writeData as Uint8Array<ArrayBuffer>
      }
    } catch (error) {
      console.error(error)
      setIsCoreLoading(false)
    }
  }

  const acceptedFileTypes = React.useMemo(
    () => (mediaAction.inputType === 'video' ? 'video/*' : 'audio/*'),
    [mediaAction.inputType]
  )

  function handleClearFile() {
    resetProgress()
    setSelectedFile(null)
    if (inputFileRef !== null && inputFileRef.current !== null) {
      inputFileRef.current.files = null
    }
  }

  React.useEffect(() => {
    handleClearFile()
  }, [mediaAction.inputType])

  const progressText = React.useMemo(() => {
    let text = `Processing... ${progress}%`
    if (timeRemaining) {
      text += ` (${timeRemaining})`
    }
    if (targetFileSize > 0) {
      text += ` (${getFileSize(targetFileSize)})`
    }
    return text
  }, [progress, timeRemaining, targetFileSize])

  const pickFileText = React.useMemo(() => {
    const fileType = capitalizeFirstLetter(mediaAction.inputType)
    return `${
      selectedFile ? 'Change' : 'Select'
    } ${fileType} (max. ${MAXIMUM_FILE_SIZE})`
  }, [mediaAction.inputType, selectedFile])

  function resetProgress() {
    setProgress(0)
    setTimeRemaining(null)
    setIsCoreLoading(false)
  }

  React.useEffect(() => {
    resetProgress()
  }, [mediaAction])

  return (
    <FFMPEGContext.Provider
      value={{
        isLoading,
        setIsLoading,
        progress,
        setProgress,
        targetFileSize,
        setTargetFileSize,
        targetDownloadUrl,
        setTargetDownloadUrl,
        runFFMPEG,
      }}
    >
      <nav className="z-10 sticky top-0 bg-primary h-12 flex justify-between w-full items-center p-4 h-16">
        <a href="/" className="flex items-center">
          <img src="/entropy-logo.svg" alt="Entropy logo" className="h-8" />
          <h1 className="ml-3 text-2xl font-['Lexend_Deca'] font-medium text-white invisible md:visible">
            Entropy
          </h1>
        </a>
        <a
          ref={githubIconRef}
          href="https://github.com/vyonizr/entropy"
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 flex justify-center items-center rounded-full text-white/[.75] hover:text-white hover:bg-white/[.1]"
          aria-label="GitHub repository"
        >
          <FaGithub className="text-3xl" />
        </a>
      </nav>
      <main className="flex flex-col items-center px-4 pt-4">
        <h1 className="text-5xl font-medium block md:hidden font-['Lexend_Deca'] ">
          Entropy
        </h1>
        <h2 className="mt-4 md:mt-2 text-center text-lg w-[24rem] md:w-[32rem] md:text-2xl">
          <Balancer>
            A web-based media converter entirely done on the browser.{' '}
            <strong>No upload needed.</strong>
          </Balancer>
        </h2>
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-gray-500">
            Choose an action
          </legend>
          <ul>
            {RADIO_OPTIONS.map((option) => (
              <li key={option.value}>
                <input
                  type="radio"
                  name="media-action"
                  value={option.label}
                  id={option.value}
                  checked={mediaAction.value === option.value}
                  onChange={() => setMediaAction(option)}
                  disabled={isLoading}
                />
                <label htmlFor={option.value}>{`${getEmojiFromType(
                  option.icon
                )} ${option.label}`}</label>
              </li>
            ))}
          </ul>
        </fieldset>
        <FileInput
          className="w-full max-w-[22rem] mt-4 flex items-center justify-center"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isLoading}
        >
          {selectedFile ? (
            <FaExchangeAlt />
          ) : mediaAction.inputType === 'video' ? (
            <FaFileVideo />
          ) : (
            <FaFileAudio />
          )}
          <span className="ml-2">{pickFileText}</span>
        </FileInput>
        {error.isError && (
          <p className="mt-2 text-red-500 text-center" role="alert">{error.message}</p>
        )}
        {selectedFile && (
          <>
            {selectedFile.type.includes('video') && (
              <video
                className="mt-4 max-h-52 max-w-[22rem] rounded object-cover"
                src={previewUrl}
                controls
                ref={videoRef}
              />
            )}
            {selectedFile.type.includes('audio') && (
              <audio
                controls
                className="mt-4 max-h-52 max-w-[22rem] rounded"
                src={previewUrl}
                ref={audioRef}
              />
            )}

            <div className="mt-2 grid w-full max-w-[22rem] grid-cols-[1fr_3rem] items-center rounded border-2 border-gray-200">
              <p className="px-2 font-mono text-sm">
                {truncateFileName(selectedFile.name)}
              </p>
              <IconButton
                icon="trash"
                label="Remove file"
                onClick={handleClearFile}
                disabled={isLoading}
                className="border-l-2 border-gray-200 bg-gray-200 text-gray-600"
              />
            </div>
            <ConvertActions action={mediaAction.value} file={selectedFile} />
          </>
        )}
        {isCoreLoading && progress === 0 && (
          <p className="mt-2" aria-live="polite">Preparing...</p>
        )}
        {progress > 0 && (
          <>
            <p className="mt-2" aria-live="polite">{progressText}</p>
            <div
              className="h-2 w-full max-w-[22rem] overflow-hidden rounded bg-gray-300"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-2 bg-primary"
                style={{ width: `${progress}%`, transitionDuration: '100ms' }}
              />
            </div>
          </>
        )}
      </main>
      <footer className="w-full absolute bottom-0 flex justify-center items-center h-8">
        v{import.meta.env.PACKAGE_VERSION}
      </footer>
    </FFMPEGContext.Provider>
  )
}
