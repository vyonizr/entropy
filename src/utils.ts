export function trimFilename(filename: string) {
  const lastDot = filename.lastIndexOf('.')
  return filename.substring(0, lastDot)
}

export function generateOutputName(fileName: string, extension: string) {
  return `${trimFilename(fileName)}_entropy.${extension}`
}
