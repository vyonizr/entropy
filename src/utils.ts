export function trimFilename(filename: string) {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) {
    return filename
  } else if (dotIndex === 0) {
    return ''
  }

  return filename.substring(0, dotIndex)
}

export function generateOutputName(fileName: string, extension: string) {
  return `${trimFilename(fileName)}_entropy.${extension}`
}

export function truncateFileName(fileName: string, maxLength = 24): string {
  if (fileName.length <= maxLength) {
    return fileName
  }

  const fileNameWithoutExtension = fileName.split('.')[0]
  const extension = fileName.split('.').pop()
  const halfLength = Math.floor(maxLength / 2)

  const start = fileNameWithoutExtension.slice(0, halfLength)
  const end = fileNameWithoutExtension.slice(-halfLength)

  return `${start}...${end}.${extension}`
}

export function getFileExtension(filename: string) {
  const lastDot = filename.lastIndexOf('.')
  return filename.substring(lastDot + 1)
}

export function triggerDownload(URL: string, fileName: string) {
  const anchor = document.createElement('a')
  anchor.href = URL
  anchor.download = fileName
  anchor.click()
}

export function getFileSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0

  while (size >= 1024) {
    size /= 1024
    i++
  }

  return `${size.toFixed(2)} ${units[i]}`
}

export function getEmojiFromType(type: string): string {
  switch (type) {
    case 'video':
      return '🎥'
    case 'audio':
      return '🎵'
    case 'image':
      return '🖼️'
    default:
      return '📁'
  }
}

// This function formats a number of seconds into a string formatted as "HH:MM:SS.mmm".
// It takes the number of seconds as an input.
export function formatTime(time: number): string {
  // should handle if time is negative
  if (time < 0) {
    throw new Error('Time cannot be negative')
  } else if (isNaN(time)) {
    throw new Error('Time must be a number')
  }

  // Calculate the number of hours, minutes, and seconds.
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)
  // Calculate the number of milliseconds.
  const milliseconds = Math.round((time % 1) * 1000)

  // Return a string formatted as "HH:MM:SS.mmm".
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
    .toString()
    .padStart(3, '0')}`
}

export function calculateTimeRemaining(
  totalDuration: number,
  currentDuration: number,
  processSpeed: number
): number {
  // should throw error if total is negative
  if (totalDuration < 0) {
    throw new Error('Total duration cannot be negative')
  } else if (isNaN(totalDuration)) {
    throw new Error('Total duration must be a number')
  }
  // should return 0 if current duration is equal or greater than total duration
  if (currentDuration >= totalDuration) {
    return 0
  }

  const timeRemaining = (totalDuration - currentDuration) / processSpeed
  return timeRemaining
}

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let formattedTime = ''

  if (hours > 0) {
    formattedTime += `${hours}h `
  }

  if (minutes > 0) {
    formattedTime += `${minutes}m `
  }

  if (remainingSeconds > 0 || formattedTime === '') {
    formattedTime += `${remainingSeconds}s`
  }

  return formattedTime.trim()
}

type TParseFFmpegOutput = {
  time: number
  speed: number
}

export function parseFFmpegTimeLog(
  logMessage: string | undefined
): TParseFFmpegOutput | null {
  if (logMessage === undefined) {
    return null
  }

  const time = logMessage.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/)
  const speed = logMessage.match(/speed=(\d{1}\.\d{3})x/)

  if (!time || !speed) {
    return null
  }

  function convertTimeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map((t) => Number(t))
    return hours * 3600 + minutes * 60 + seconds
  }

  const timeInSeconds = convertTimeToSeconds(time[1])
  const speedAsNumber = parseFloat(speed[1])

  return {
    time: timeInSeconds,
    speed: speedAsNumber,
  }
}

// capitalize first letter in text
export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
