export function trimFilename(filename: string) {
  const lastDot = filename.lastIndexOf('.')
  return filename.substring(0, lastDot)
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
