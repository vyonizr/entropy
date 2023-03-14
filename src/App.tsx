import React, { useMemo } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import Balancer from 'react-wrap-balancer'

import { RADIO_OPTIONS } from './constants'
import { truncateFileName } from './utils'

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
  ): Promise<Uint8Array | undefined> => Promise.resolve(undefined),
})

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [targetFileSize, setTargetFileSize] = React.useState(0);
  const [targetDownloadUrl, setTargetDownloadUrl] = React.useState('');
  const [mediaAction, setMediaAction] = React.useState(RADIO_OPTIONS[0]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  function handleFileChange(file: File | null) {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
    }
  }

  async function runFFMPEG(
    selectedFile: File,
    outputName: string,
    method = ''
  ) {
    try {
      if (selectedFile) {
        const ffmpeg = createFFmpeg({
          log: true,
          progress: ({ ratio }) => {
            setProgress(Math.round(ratio * 100));
          },
        });

        await ffmpeg.load();
        ffmpeg.FS(
          'writeFile',
          selectedFile.name,
          await fetchFile(selectedFile)
        );
        await ffmpeg.run(
          '-i',
          selectedFile.name,
          ...method.split(' '),
          outputName
        );

        const writeData = ffmpeg.FS('readFile', outputName);
        ffmpeg.exit();

        return writeData;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const acceptedFileTypes = useMemo(
    () => (mediaAction.type === 'video' ? 'video/*' : 'audio/*'),
    [mediaAction.type]
  );

  function handleClearFile() {
    setSelectedFile(null);
    if (inputFileRef !== null && inputFileRef.current !== null) {
      inputFileRef.current.files = null;
    }
  }

  React.useEffect(() => {
    handleClearFile();
  }, [mediaAction.type]);

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
      <main className="flex flex-col items-center px-4 pt-4 pb-2">
        <h1 className="text-3xl font-black">Entropy</h1>
        <h2 className="mt-4 text-center text-lg">
          <Balancer>
            A web-based media converter entirely done on the browser{' '}
            <strong>
              <em>without</em>{' '}
            </strong>{' '}
            file upload
          </Balancer>
        </h2>
        <ul className="mt-4">
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
              <label htmlFor={option.value}>{option.label}</label>
            </li>
          ))}
        </ul>
        <FileInput
          className="mt-4"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isLoading}
        >
          {`${selectedFile ? 'Change' : 'Select'} File`}
        </FileInput>
        {selectedFile && (
          <>
            <video
              className="mt-4 max-h-52 max-w-[22rem] rounded object-cover"
              src={previewUrl}
              controls
              ref={videoRef}
            />
            <div className="mt-2 grid w-full max-w-[22rem] grid-cols-[1fr_3rem] items-center rounded border-2 border-gray-200">
              <p className="px-2 font-mono text-sm">
                {truncateFileName(selectedFile.name)}
              </p>
              <IconButton
                icon="trash"
                onClick={handleClearFile}
                disabled={isLoading}
                className="border-l-2 border-gray-200 bg-gray-200"
              />
            </div>
            <ConvertActions action={mediaAction.value} file={selectedFile} />
          </>
        )}
        {progress > 0 && (
          <>
            <p className="mt-2">Transcoding... {progress}%</p>
            <div className="h-2 w-full max-w-[22rem] overflow-hidden rounded bg-gray-300">
              <div
                className="h-2 bg-primary"
                style={{ width: `${progress}%`, transitionDuration: '100ms' }}
              />
            </div>
          </>
        )}
        <footer className="mt-4">
          v{import.meta.env.PACKAGE_VERSION} |{' '}
          <a
            href="https://github.com/vyonizr/entropy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Github
          </a>
        </footer>
      </main>
    </FFMPEGContext.Provider>
  );
}
