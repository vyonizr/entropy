import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const srcDir = path.join(rootDir, 'node_modules/@ffmpeg/core/dist/esm')
const destDir = path.join(rootDir, 'public/ffmpeg')

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

await mkdir(destDir, { recursive: true })
await Promise.all(
  files.map((file) => copyFile(path.join(srcDir, file), path.join(destDir, file)))
)

console.log(`Copied ${files.join(', ')} to public/ffmpeg/`)
